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
from users.schemas import UserStatus, weights_user_status
from shops.models import ShopORM, ShopAccessORM
from databases.sqlalchemy import get_db


oauth2_schema = OAuth2PasswordBearer(tokenUrl="/login")


async def get_token_data(
    token: str = Depends(oauth2_schema),
    db: AsyncSession = Depends(get_db)
) -> UserORM:
    """Возвращает данные из токена 'Authorization'"""

    try:
        token_data = AccessTokenData(**JWTService.decode(token))
        user = await UserORM.get_by_id(token_data.sub, db)

        if not user:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED)

        if token_data.status != user.status:
            raise HTTPException(
                status_code=status.HTTP_428_PRECONDITION_REQUIRED,
                detail="User state is outdated"
            )

    except (DecodeError, InvalidSignatureError, ExpiredSignatureError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED)

    return user


async def get_user(user: UserORM = Depends(get_token_data)) -> UserORM:
    """Возвращает id авторизованного пользователя"""

    if user.status == UserStatus.BANNED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="user is banned"
        )

    return user


async def get_shop(
    shop_id: UUID,
    user: UserORM = Depends(get_user),
    db: AsyncSession = Depends(get_db)
) -> ShopORM:
    """Возвращает shop_id и проверяет что к нему есть доступ"""

    shop = await ShopORM.get_by_id(shop_id, db)

    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="shop not found"
        )

    access = (
        await ShopAccessORM.check_access(shop.id, user.id, db)
        or user.status == UserStatus.OWNER
    )

    if not access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="not shop access"
        )

    return shop


async def get_user_status(user: UserORM = Depends(get_token_data)) -> UserStatus:
    """Возвращает status авторизованного пользователя"""

    return user.status


def check_user_min_status(min_status: UserStatus) -> Callable[[UserStatus], None]:
    """Проверяет статус для доступа"""

    def logic(user_status: UserStatus = Depends(get_user_status)) -> None:

        if weights_user_status[min_status] > weights_user_status[user_status]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough rights"
            )

    return logic


CurrentUser = Annotated[UserORM, Depends(get_user)]
CurrentShop = Annotated[ShopORM, Depends(get_shop)]
UserStatusISWorker = Depends(check_user_min_status(UserStatus.WORKER))
UserStatusISAdmin = Depends(check_user_min_status(UserStatus.ADMIN))
UserStatusISOwner = Depends(check_user_min_status(UserStatus.OWNER))
