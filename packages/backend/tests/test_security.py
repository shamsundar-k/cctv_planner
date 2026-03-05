"""Unit tests for app/core/security.py — password hashing, JWT creation/decoding, refresh token."""

import pytest
from jose import JWTError

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_hash_password_returns_different_from_plain():
    hashed = hash_password("secret123")
    assert hashed != "secret123"


def test_verify_password_correct():
    hashed = hash_password("mypassword")
    assert verify_password("mypassword", hashed) is True


def test_verify_password_wrong():
    hashed = hash_password("mypassword")
    assert verify_password("wrongpassword", hashed) is False


def test_create_and_decode_access_token():
    token = create_access_token(user_id="abc123", role="admin")
    payload = decode_access_token(token)
    assert payload["sub"] == "abc123"
    assert payload["role"] == "admin"


def test_decode_access_token_invalid_raises():
    with pytest.raises(JWTError):
        decode_access_token("not.a.valid.token")


def test_create_refresh_token_is_urlsafe_string():
    token = create_refresh_token()
    assert isinstance(token, str)
    assert len(token) > 20


def test_refresh_tokens_are_unique():
    t1 = create_refresh_token()
    t2 = create_refresh_token()
    assert t1 != t2
