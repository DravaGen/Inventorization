from uuid import UUID
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer

from .jwt import JWTService
from jwt.exceptions import DecodeError, InvalidSignatureError, \
    ExpiredSignatureError

from .schemas import AccessTokenData
from users.schemas import UserStatus, weights_user_status


oauth2_schema = OAuth2PasswordBearer(tokenUrl="/login")


def get_token_data(
        token: str = Depends(oauth2_schema)
) -> AccessTokenData:
    """Возвращает данные из токена 'Authorization'"""

    try:
        token_data = AccessTokenData(**JWTService.decode(token))

    except (DecodeError, InvalidSignatureError, ExpiredSignatureError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED)

    return token_data


def get_user_id(
        data: AccessTokenData = Depends(get_token_data)
) -> UUID:
    """Возвращает id авторизованного пользователя"""

    return data.sub


def get_user_status(
        data: AccessTokenData = Depends(get_token_data)
) -> UserStatus:
    """Возвращает status авторизованного пользователя"""

    return data.status


def check_user_min_status(min_status: UserStatus) -> Depends:
    """Проверяет статус для доступа"""

    def logic(user_status: UserStatus = Depends(get_user_status)) -> None:

        if weights_user_status[min_status] > weights_user_status[user_status]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough rights"
            )

    return Depends(logic)
