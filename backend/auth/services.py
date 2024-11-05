from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer

from .jwt import JWTService
from jwt.exceptions import DecodeError, InvalidSignatureError, \
    ExpiredSignatureError

from users.schemas import UserStatus


oauth2_schema = OAuth2PasswordBearer(tokenUrl="/login")


def get_token_data(
        token: str = Depends(oauth2_schema)
) -> str:
    """Возвращает данные из токена 'Authorization'"""

    try:
        token_data = JWTService.decode(token)

    except (DecodeError, InvalidSignatureError, ExpiredSignatureError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED)

    return token_data


def get_user_id(
        data: dict = Depends(get_token_data)
) -> str:
    """Возвращает id авторизованного пользователя"""

    return data["sub"]


def get_user_status(
        data: dict = Depends(get_token_data)
) -> UserStatus:
    """Возвращает status авторизованного пользователя"""

    return UserStatus(data["status"])
