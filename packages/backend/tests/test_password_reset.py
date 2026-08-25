from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

from beanie import PydanticObjectId
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
import pytest

from app.api_models.auth import PasswordChangeRequest, PasswordResetRequestCreate
from app.api_models.user import SystemRole
from app.core import deps
from app.models.password_reset_request import PasswordResetStatus
from app.routers import admin, auth
from app.services import auth_service, auth_token_service


USER_ID = PydanticObjectId("66584aef0f5f3e6d8f8a1234")
ADMIN_ID = PydanticObjectId("66584aef0f5f3e6d8f8a5678")
REQUEST_ID = PydanticObjectId("66584aef0f5f3e6d8f8a9012")


class FakeRecord(SimpleNamespace):
    async def save(self) -> None:
        self.saved = True


class FakeRedis:
    def __init__(self) -> None:
        self.values: dict[str, str] = {}

    async def get(self, key: str) -> str | None:
        return self.values.get(key)

    async def set(self, key: str, value: str, **_: object) -> None:
        self.values[key] = value

    async def delete(self, key: str) -> None:
        self.values.pop(key, None)


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
    redis = FakeRedis()
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

    result = await auth.change_password(
        PasswordChangeRequest(
            current_password="login@123",
            new_password="a-new-secure-password",
        ),
        redis,
        user,
    )

    assert user.hashed_password == "new-hash"
    assert user.must_change_password is False
    assert user.token_version == 3
    assert user.saved is True
    assert result.access_token == "new-access-token"
    assert result.refresh_token == "new-refresh-token"
    assert list(redis.values.values()) == [f"{USER_ID}:3"]


async def test_old_refresh_token_version_is_rejected(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    redis = FakeRedis()
    key = auth_token_service.token_key("old-refresh")
    redis.values[key] = f"{USER_ID}:1"
    monkeypatch.setattr(
        auth_token_service.User,
        "get",
        AsyncMock(return_value=fake_user()),
    )

    with pytest.raises(HTTPException) as error:
        await auth.refresh(SimpleNamespace(refresh_token="old-refresh"), redis)

    assert error.value.status_code == 401
    assert key not in redis.values
