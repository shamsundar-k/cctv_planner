"""FastAPI dependencies: get_current_user (JWT → User) and require_admin (system_role == admin)."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError

from app.api_models.user import SystemRole
from app.db_schemas.user import User
from .security import decode_access_token

_bearer = HTTPBearer()


async def get_authenticated_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> User:
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = await User.get(payload["sub"])
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if payload.get("ver", 0) != user.token_version:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session is no longer valid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def get_current_user(
    current_user: User = Depends(get_authenticated_user),
) -> User:
    if current_user.must_change_password:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Password change required",
        )
    return current_user


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.system_role != SystemRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user
