"""Security utilities for authentication and token management.

This module provides functions for:
- Password hashing and verification using bcrypt
- JWT access token creation and decoding with expiration
- Refresh token generation for session management

Functions:
  hash_password: Hash a plain password using bcrypt with salt
  verify_password: Verify a plain password against a bcrypt hash
  create_access_token: Generate a JWT access token with user_id, role, and expiration
  create_refresh_token: Generate a secure random refresh token
  decode_access_token: Decode and validate a JWT access token, raising JWTError if invalid/expired
"""

import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from .config import settings
import logging
logger = logging.getLogger(__name__)    

def hash_password(plain: str) -> str:
    """Hash a plain password using bcrypt with a randomly generated salt.
    
    Args:
        plain: Plain text password to hash
    
    Returns:
        Hashed password string suitable for storage in database
    """
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain password against a bcrypt hash.
    
    Args:
        plain: Plain text password to verify
        hashed: Hashed password from database
    
    Returns:
        True if password matches hash, False otherwise. Logs warning on failure.
    """
    is_valid = bcrypt.checkpw(plain.encode(), hashed.encode())
    if not is_valid:
        logger.warning("Password verification failed")
    return is_valid


def create_access_token(user_id: str, role: str) -> str:
    """Generate a JWT access token with user identity and expiration.
    
    Args:
        user_id: Unique user identifier
        role: User role for authorization (included in token payload)
    
    Returns:
        Encoded JWT access token with expiration set via JWT_ACCESS_TTL_MINUTES config
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_TTL_MINUTES)
    payload = {"sub": user_id, "role": role, "exp": expire}
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")
    logger.info("Access token created for user %s with role %s", user_id, role)
    return token


def create_refresh_token() -> str:
    """Generate a secure random refresh token.
    
    Returns:
        URL-safe base64 encoded random token (32 bytes)
    """
    return secrets.token_urlsafe(32)


def decode_access_token(token: str) -> dict:
    """Decode and validate a JWT access token.
    
    Args:
        token: JWT access token to decode and verify
    
    Returns:
        Decoded token payload containing sub (user_id), role, and exp claims
    
    Raises:
        JWTError: If token is invalid, expired, or signature verification fails
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        logger.debug("Access token decoded successfully for user %s", payload.get("sub"))
        return payload
    except JWTError as e:
        logger.warning("Failed to decode access token: %s", str(e))
        raise
