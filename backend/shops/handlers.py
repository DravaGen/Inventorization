from uuid import UUID
from typing import Optional
from fastapi import APIRouter

from .schemas import ShopResponse, ShopCreateForm, ShopUpdateForm, \
    UserAccessResponse, ShopAccessResponse
from .services import ShopService

from auth.services import CurrentUser, CurrentShop, \
    UserStatusISOwner, UserStatusISWorker, UserStatusISAdmin
from databases.sqlalchemy import SessionDep


shops_router = APIRouter()
shops_access_router = APIRouter()


@shops_router.post(
    "/",
    dependencies=[UserStatusISOwner]
)
async def create_shop(
    user: CurrentUser,
    form: ShopCreateForm,
    db: SessionDep
) -> ShopResponse:
    """Создает магазин"""

    shop = ShopService.create_shop(user, form, db)
    return ShopResponse.model_validate(shop)


@shops_router.patch(
    "/",
    dependencies=[UserStatusISOwner]
)
async def update_shop(
    shop: CurrentShop,
    form: ShopUpdateForm,
    db: SessionDep
) -> None:
    """Обновляет магазин"""

    await ShopService.update_shop(shop, form, db)


@shops_router.get(
    "/list",
    dependencies=[UserStatusISWorker]
)
async def get_shops(
    user: CurrentUser,
    db: SessionDep
) -> list[Optional[ShopResponse]]:
    """Возвращает все магазины в зависимости от доступа"""

    shops = await ShopService.get_shops(user, db)
    return [ShopResponse.model_validate(shop) for shop in shops]


@shops_access_router.get(
    "/",
    dependencies=[UserStatusISAdmin]
)
async def get_access(
    shop: CurrentShop,
    db: SessionDep
) -> ShopAccessResponse:
    """Возвращает пользователей которые имеют доступ в магазин"""

    return await ShopService.get_access(shop, db)


@shops_access_router.get(
    "/self",
    dependencies=[UserStatusISWorker]
)
async def get_self_access(
    user: CurrentUser,
    db: SessionDep
)-> UserAccessResponse:
    """Возвращает пользователей которые прикреплены к магазину"""

    return await ShopService.get_self_access(user, db)


@shops_access_router.post(
    "/",
    dependencies=[UserStatusISOwner]
)
async def grant_access(
    shop: CurrentShop,
    user_id: UUID,
    db: SessionDep
)-> None:
    """Выдает доступ к магазину"""

    await ShopService.grant_access(shop, user_id, db)


@shops_access_router.delete(
    "/",
    dependencies=[UserStatusISOwner]
)
async def revoke_access(
    shop: CurrentShop,
    user_id: UUID,
    db: SessionDep
)-> None:
    """Удаляет доступ к магазину"""

    await ShopService.revoke_access(shop, user_id, db)
