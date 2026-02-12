from uuid import UUID
from typing import Callable, Annotated

from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer

from sqlalchemy.ext.asyncio import AsyncSession

from jwt.exceptions import DecodeError, InvalidSignatureError, \
    ExpiredSignatureError

from .jwt import JWTService
from .schemas import AccessTokenData
from users.models import UserORM
from users.services import get_user_by_id
from users.schemas import UserStatus, weights_user_status
from shops.services import check_shop_access
from databases.sqlalchemy import get_db


oauth2_schema = OAuth2PasswordBearer(tokenUrl="/login")


async def get_token_data(
        token: str = Depends(oauth2_schema)
) -> UserORM:
    """Возвращает данные из токена 'Authorization'"""

    try:
        token_data = AccessTokenData(**JWTService.decode(token))
        user_data = await get_user_by_id(token_data.sub)

    except (DecodeError, InvalidSignatureError, ExpiredSignatureError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED)

    return user_data


async def get_user_id(
        data: UserORM = Depends(get_token_data)
) -> UUID:
    """Возвращает id авторизованного пользователя"""

    if data.status == UserStatus.BANNED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="user is banned"
        )

    return data.id


async def get_shop_id(
    shop_id: UUID,
    user_id: UUID = Depends(get_user_id),
    db: AsyncSession = Depends(get_db)
) -> UUID:
    """Возвращает shop_id и проверяет что к нему есть доступ"""

    access = (
        await check_shop_access(user_id, shop_id, db)
        or (await get_user_by_id(user_id, db)).status == UserStatus.OWNER
    )

    if not access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="not shop access"
        )

    return shop_id


async def get_user_status(
        data: UserORM = Depends(get_token_data)
) -> UserStatus:
    """Возвращает status авторизованного пользователя"""

    return data.status


def check_user_min_status(
        min_status: UserStatus
) -> Callable[[UserStatus], None]:
    """Проверяет статус для доступа"""

    def logic(user_status: UserStatus = Depends(get_user_status)) -> None:

        if weights_user_status[min_status] > weights_user_status[user_status]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough rights"
            )

    return logic


CurrentUserID = Annotated[UUID, Depends(get_user_id)]
CurrentShopID = Annotated[UUID, Depends(get_shop_id)]
UserStatusISWorker = Depends(check_user_min_status(UserStatus.WORKER))
UserStatusISAdmin = Depends(check_user_min_status(UserStatus.ADMIN))
UserStatusISOwner = Depends(check_user_min_status(UserStatus.OWNER))
