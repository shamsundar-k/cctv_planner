# Redis-to-MongoDB Refresh-Token Migration Plan

## Goal

Remove the backend's Redis dependency without changing the public authentication
API or weakening session security. MongoDB will become the sole persistence
service for refresh-token sessions.

## Current Redis Scope

Redis is used only for refresh-token lifecycle management. It is not used for
caching, invitations, password-reset requests, rate limiting, queues, or
WebSockets.

| Current operation | Redis behaviour | Replacement |
| --- | --- | --- |
| Login, accepted invite, password change | Store SHA-256 hash of a new refresh token with a seven-day TTL and the `user_id:token_version` value | Insert a MongoDB refresh-token document |
| Token refresh | Read the token hash, verify the user/version, delete the key, issue a replacement | Atomically consume the MongoDB document, verify it, then issue a replacement |
| Logout | Delete the hash key | Delete the matching MongoDB document |
| Token expiry | Redis key expires automatically | `expires_at` validation plus a MongoDB TTL index for cleanup |

Access-token invalidation already depends on MongoDB: `User.token_version` is
checked for every authenticated request. This remains unchanged.

## Target Data Model

Add `app/models/refresh_token.py` as a Beanie `Document` named
`refresh_tokens`.

```python
class RefreshToken(Document):
    token_hash: str
    user_id: PydanticObjectId
    token_version: int
    expires_at: datetime
    created_at: datetime

    class Settings:
        name = "refresh_tokens"
        indexes = [
            IndexModel("token_hash", unique=True),
            IndexModel("expires_at", expireAfterSeconds=0),
            IndexModel([("user_id", 1), ("expires_at", 1)]),
        ]
```

Requirements:

- Never persist the raw refresh token.
- Keep the existing SHA-256 hashing method so token values are never logged or
  stored.
- Set `expires_at` to UTC now plus `JWT_REFRESH_TTL_DAYS`.
- Treat `expires_at` as authoritative during reads. A MongoDB TTL monitor
  cleans expired documents asynchronously, so the application must reject an
  expired document even if cleanup has not yet run.
- The unique hash index prevents duplicate storage of a token.

## Implementation Steps

1. Register `RefreshToken` in `init_beanie` in `app/core/database.py`.

2. Replace Redis types and calls in `app/services/auth_token_service.py`:

   - `issue_tokens(user)` creates the access token and inserts a refresh-token
     document.
   - `rotate_tokens(raw_token)` calculates its hash and performs an atomic
     `find_one_and_delete` against the MongoDB collection. Use the underlying
     Motor collection if necessary; do not implement this as separate find and
     delete calls.
   - After consuming the document, reject it when it is expired, its user no
     longer exists, or its saved `token_version` differs from the user record.
   - Only after validation succeeds, create and persist the replacement
     refresh token.
   - `revoke_token(raw_token)` deletes by `token_hash`.

3. Remove the `redis: Redis` parameter through the auth call chain:

   - `app/services/auth_service.py`
   - `app/routers/auth.py`
   - `issue_tokens`, `rotate_tokens`, and `revoke_token` callers

   The request and response schemas and all HTTP route paths stay unchanged.

4. Remove Redis lifecycle and configuration:

   - Remove `redis.asyncio`, `redis_client`, Redis `ping`, Redis close logic,
     and `get_redis` from `app/core/database.py`.
   - Remove `REDIS_URL` from `app/core/config.py`, `.env.example`, local setup
     documentation, and test environment defaults.
   - Remove `redis[asyncio]` from `packages/backend/pyproject.toml`, then
     regenerate `uv.lock` with the project dependency tool.
   - Update module docstrings that still describe a Redis connection.

5. Update tests to use Mongo/Beanie-level mocks or a test MongoDB instance;
   remove `FakeRedis`. Cover the following cases:

   - token issuance stores a hash, correct user/version, and expiration;
   - a valid refresh rotates exactly once;
   - reuse of a rotated token fails;
   - logout revokes the supplied refresh token;
   - expired tokens fail even before TTL cleanup;
   - password changes and admin password resets invalidate old access and
     refresh sessions through `token_version`;
   - a missing user or version mismatch consumes the presented refresh token
     and returns the existing `401 Invalid or expired refresh token` response;
   - simultaneous refresh requests using the same token yield one success and
     one failure.

6. Run the backend test suite and start the API with only a local MongoDB
   configured. Confirm `/api/v1/health`, login, refresh, logout, password
   change, and accepted-invite flows work with no `REDIS_URL` present.

## Session and Rollout Strategy

For a simple local/offline deployment, deploy this as a clean cutover. Existing
Redis-backed refresh tokens will no longer be accepted, so users sign in once
after the update. Access tokens remain valid until their normal short expiry.

If preserving active sessions matters, use a temporary compatibility release:

1. Write newly issued tokens to MongoDB while retaining Redis reads.
2. Accept a Redis token only when no MongoDB document exists; on successful
   Redis refresh, issue the replacement exclusively in MongoDB.
3. After `JWT_REFRESH_TTL_DAYS` plus the access-token TTL, remove the fallback
   and decommission Redis.

Do not dual-write indefinitely: it obscures which store owns revocation and
creates inconsistent logout/rotation behaviour.

## Acceptance Criteria

- The backend starts and operates with MongoDB configured and no Redis server
  or `REDIS_URL`.
- No backend runtime source, environment template, dependency manifest, or
  lockfile contains a Redis runtime dependency.
- Refresh token rotation remains single-use under concurrent requests.
- Logout and token-version changes invalidate refresh sessions as before.
- Expired refresh tokens are rejected regardless of the MongoDB TTL cleanup
  schedule.
- The existing frontend continues using the same login, refresh, and logout
  endpoints without code changes.

## Out of Scope

This migration removes Redis only. It does not itself make a browser fully
offline-capable. A fully disconnected setup also needs local MongoDB, local map
tiles (the Martin option), and browser-side caching/synchronisation for project
data.
