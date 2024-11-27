from uuid import UUID
from typing import Callable, Annotated

from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from jwt.exceptions import DecodeError, InvalidSignatureError, \
    ExpiredSignatureError

from .jwt import JWTService
from .schemas import AccessTokenData
from shops.models import ShopUserORM
from users.schemas import UserStatus, weights_user_status
from databases.sqlalchemy import get_db


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


async def get_shop_id(
    shop_id: UUID,
    user_id: UUID = Depends(get_user_id),
    db: AsyncSession = Depends(get_db)
) -> UUID:
    """Возвращает shop_id и проверяет что к нему есть доступ"""

    exists = await db.execute(
        select(ShopUserORM)
        .where(
            (ShopUserORM.shop_id == shop_id)
            & (ShopUserORM.user_id == user_id)
        )
    )

    if not exists.scalar():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="not shop access"
        )

    return shop_id


def get_user_status(
        data: AccessTokenData = Depends(get_token_data)
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
