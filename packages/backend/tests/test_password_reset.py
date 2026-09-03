from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock
from datetime import UTC, datetime, timedelta

from beanie import PydanticObjectId
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
import pytest

from app.api_models.auth import (
    PasswordChangeRequest,
    PasswordResetRequestCreate,
    RefreshRequest,
    TokenResponse,
)
from app.api_models.user import SystemRole
from app.core import deps
from app.models.password_reset_request import PasswordResetStatus
from app.models.refresh_token import RefreshToken
from app.routers import admin, auth
from app.services import auth_service, auth_token_service


USER_ID = PydanticObjectId("66584aef0f5f3e6d8f8a1234")
ADMIN_ID = PydanticObjectId("66584aef0f5f3e6d8f8a5678")
REQUEST_ID = PydanticObjectId("66584aef0f5f3e6d8f8a9012")


class FakeRecord(SimpleNamespace):
    async def save(self) -> None:
        self.saved = True


class FakeRefreshTokenCollection:
    def __init__(self) -> None:
        self.values: dict[str, dict[str, object]] = {}

    async def find_one_and_delete(self, query: dict[str, str]) -> dict[str, object] | None:
        return self.values.pop(query["token_hash"], None)

    async def delete_one(self, query: dict[str, str]) -> None:
        self.values.pop(query["token_hash"], None)


def use_fake_refresh_token_collection(
    monkeypatch: pytest.MonkeyPatch,
    collection: FakeRefreshTokenCollection,
) -> None:
    monkeypatch.setattr(
        RefreshToken,
        "get_pymongo_collection",
        classmethod(lambda _: collection),
    )


def fake_user(**overrides: object) -> FakeRecord:
    values: dict[str, object] = {
        "id": USER_ID,
        "email": "user@example.com",
        "hashed_password": "old-hash",
        "system_role": SystemRole.user,
        "must_change_password": False,
        "token_version": 2,
        "saved": False,
    }
    values.update(overrides)
    return FakeRecord(**values)


async def test_unknown_email_gets_generic_reset_response(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(auth_service.User, "find_one", AsyncMock(return_value=None))
    find_request = AsyncMock()
    monkeypatch.setattr(
        auth_service.PasswordResetRequestDocument,
        "find_one",
        find_request,
    )

    result = await auth.create_password_reset_request(
        PasswordResetRequestCreate(email="unknown@example.com")
    )

    assert result.message.startswith("If an account exists")
    find_request.assert_not_awaited()


async def test_reset_sets_temporary_password_and_invalidates_sessions(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    reset_request = FakeRecord(
        status=PasswordResetStatus.pending,
        user_id=USER_ID,
        resolved_at=None,
        resolved_by_id=None,
        saved=False,
    )
    user = fake_user()
    approving_admin = SimpleNamespace(id=ADMIN_ID)
    monkeypatch.setattr(
        admin,
        "_get_pending_password_reset_request",
        AsyncMock(return_value=reset_request),
    )
    monkeypatch.setattr(admin.User, "get", AsyncMock(return_value=user))
    hash_password = Mock(return_value="temporary-hash")
    monkeypatch.setattr(admin, "hash_password", hash_password)

    await admin.reset_requested_password(REQUEST_ID, approving_admin)

    hash_password.assert_called_once_with("login@123")
    assert user.hashed_password == "temporary-hash"
    assert user.must_change_password is True
    assert user.token_version == 3
    assert user.saved is True
    assert reset_request.status == PasswordResetStatus.reset
    assert reset_request.resolved_by_id == ADMIN_ID
    assert reset_request.resolved_at is not None
    assert reset_request.saved is True


async def test_reject_resolves_request_without_changing_user(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    reset_request = FakeRecord(
        status=PasswordResetStatus.pending,
        resolved_at=None,
        resolved_by_id=None,
        saved=False,
    )
    monkeypatch.setattr(
        admin,
        "_get_pending_password_reset_request",
        AsyncMock(return_value=reset_request),
    )

    await admin.reject_password_reset_request(
        REQUEST_ID, SimpleNamespace(id=ADMIN_ID)
    )

    assert reset_request.status == PasswordResetStatus.rejected
    assert reset_request.resolved_by_id == ADMIN_ID
    assert reset_request.saved is True


async def test_normal_api_access_is_blocked_until_password_changes() -> None:
    with pytest.raises(HTTPException) as error:
        await deps.get_current_user(fake_user(must_change_password=True))

    assert error.value.status_code == 403
    assert error.value.detail == "Password change required"


async def test_access_token_version_mismatch_invalidates_session(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        deps,
        "decode_access_token",
        lambda _: {"sub": str(USER_ID), "ver": 1},
    )
    monkeypatch.setattr(deps.User, "get", AsyncMock(return_value=fake_user()))
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="token")

    with pytest.raises(HTTPException) as error:
        await deps.get_authenticated_user(credentials)

    assert error.value.status_code == 401
    assert error.value.detail == "Session is no longer valid"


async def test_changing_temporary_password_clears_flag_and_rotates_version(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    user = fake_user(must_change_password=True)
    inserted_tokens: list[object] = []

    class FakeRefreshTokenDocument:
        def __init__(self, **values: object) -> None:
            self.__dict__.update(values)

        async def insert(self) -> None:
            inserted_tokens.append(self)

    monkeypatch.setattr(auth_service, "verify_password", Mock(return_value=True))
    monkeypatch.setattr(auth_service, "hash_password", Mock(return_value="new-hash"))
    monkeypatch.setattr(
        auth_token_service,
        "create_refresh_token",
        lambda: "new-refresh-token",
    )
    monkeypatch.setattr(
        auth_token_service,
        "create_access_token",
        lambda *args: "new-access-token",
    )
    monkeypatch.setattr(auth_token_service, "RefreshToken", FakeRefreshTokenDocument)

    result = await auth.change_password(
        PasswordChangeRequest(
            current_password="login@123",
            new_password="a-new-secure-password",
        ),
        user,
    )

    assert user.hashed_password == "new-hash"
    assert user.must_change_password is False
    assert user.token_version == 3
    assert user.saved is True
    assert result.access_token == "new-access-token"
    assert result.refresh_token == "new-refresh-token"
    assert len(inserted_tokens) == 1
    stored_token = inserted_tokens[0]
    assert stored_token.token_hash == auth_token_service.token_hash("new-refresh-token")
    assert stored_token.user_id == USER_ID
    assert stored_token.token_version == 3


async def test_old_refresh_token_version_is_rejected(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    collection = FakeRefreshTokenCollection()
    token_hash = auth_token_service.token_hash("old-refresh")
    collection.values[token_hash] = {
        "token_hash": token_hash,
        "user_id": USER_ID,
        "token_version": 1,
        "expires_at": datetime.now(UTC) + timedelta(days=1),
    }
    use_fake_refresh_token_collection(monkeypatch, collection)
    monkeypatch.setattr(
        auth_token_service.User,
        "get",
        AsyncMock(return_value=fake_user()),
    )

    with pytest.raises(HTTPException) as error:
        await auth.refresh(RefreshRequest(refresh_token="old-refresh"))

    assert error.value.status_code == 401
    assert token_hash not in collection.values


async def test_valid_refresh_token_is_consumed_and_rotated(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    collection = FakeRefreshTokenCollection()
    old_hash = auth_token_service.token_hash("old-refresh")
    collection.values[old_hash] = {
        "token_hash": old_hash,
        "user_id": USER_ID,
        "token_version": 2,
        "expires_at": datetime.now(UTC) + timedelta(days=1),
    }
    use_fake_refresh_token_collection(monkeypatch, collection)
    expected_tokens = TokenResponse(
        access_token="replacement-access-token",
        refresh_token="replacement-refresh-token",
    )
    issue_tokens = AsyncMock(return_value=expected_tokens)
    monkeypatch.setattr(auth_token_service.User, "get", AsyncMock(return_value=fake_user()))
    monkeypatch.setattr(auth_token_service, "issue_tokens", issue_tokens)

    result = await auth_token_service.rotate_tokens("old-refresh")

    assert result == expected_tokens
    assert old_hash not in collection.values
    issue_tokens.assert_awaited_once()


async def test_logout_revokes_refresh_token(monkeypatch: pytest.MonkeyPatch) -> None:
    collection = FakeRefreshTokenCollection()
    token_hash = auth_token_service.token_hash("logout-refresh")
    collection.values[token_hash] = {"token_hash": token_hash}
    use_fake_refresh_token_collection(monkeypatch, collection)

    await auth_token_service.revoke_token("logout-refresh")

    assert token_hash not in collection.values


async def test_expired_refresh_token_is_rejected_before_ttl_cleanup(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    collection = FakeRefreshTokenCollection()
    token_hash = auth_token_service.token_hash("expired-refresh")
    collection.values[token_hash] = {
        "token_hash": token_hash,
        "user_id": USER_ID,
        "token_version": 2,
        "expires_at": datetime.now(UTC) - timedelta(seconds=1),
    }
    use_fake_refresh_token_collection(monkeypatch, collection)

    with pytest.raises(HTTPException) as error:
        await auth_token_service.rotate_tokens("expired-refresh")

    assert error.value.status_code == 401
    assert token_hash not in collection.values
