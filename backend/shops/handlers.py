from typing import Optional
from fastapi import APIRouter

from sqlalchemy import insert, select, delete

from .models import ShopORM, ShopUserORM
from .schemas import ShopResponse, ShopCrateForm, ShopCrateResponse, \
    ShopAccessResponse, ShopAccessForm

from auth.services import CurrentUserID, UserStatusISOwner
from databases.sqlalchemy import SessionDep
from responses import ResponseOK


shops_router = APIRouter()


@shops_router.post(
    "/",
    dependencies=[UserStatusISOwner]
)
async def create_shop(
        user_id: CurrentUserID,
        form_data: ShopCrateForm,
        db: SessionDep
) -> ShopCrateResponse:
    """Создает магазин. Статус OWNER"""

    shop = await db.execute(
        insert(ShopORM)
        .values(**form_data.model_dump())
        .returning(ShopORM)
    )
    shop = shop.scalar()

    await db.execute(
        insert(ShopUserORM)
        .values({
            "user_id": user_id,
            "shop_id": shop.id
        })
    )

    return ShopCrateResponse.model_validate(shop)


@shops_router.get(
    "/list",
    dependencies=[UserStatusISOwner]
)
async def get_shops(
        db: SessionDep
) -> list[Optional[ShopResponse]]:
    """Возвращает все магазины. Статус OWNER"""

    shops = await db.execute(select(ShopORM))
    return [ShopResponse.model_validate(x) for x in shops.scalars()]


shops_access_router = APIRouter(
    prefix="/access",
    tags=["Shops Access"]
)


@shops_access_router.get("/")
async def get_self_access(
        user_id: CurrentUserID,
        db: SessionDep
)-> ShopAccessResponse:
    """Возвращает магазины к которым прикреплен пользователь"""

    shops = await db.execute(
        select(ShopUserORM.shop_id)
        .where(ShopUserORM.user_id == user_id)
    )
    return ShopAccessResponse(
        user_id=user_id,
        shop_ids=shops.scalars().all()
    )


@shops_access_router.post(
    "/",
    dependencies=[UserStatusISOwner]
)
async def issue_access(
        form_data: ShopAccessForm,
        db: SessionDep
)-> ResponseOK:
    """Выдает доступ к магазину. Статус OWNER"""

    await db.execute(
        insert(ShopUserORM)
        .values(**form_data.model_dump())
    )
    return ResponseOK(detail="access granted")


@shops_access_router.delete(
    "/",
    dependencies=[UserStatusISOwner]
)
async def take_access(
        form_data: ShopAccessForm,
        db: SessionDep
)-> ResponseOK:
    """Отзывает доступ к магазину. Статус OWNER"""

    await db.execute(
        delete(ShopUserORM)
        .where(
            (ShopUserORM.shop_id == form_data.shop_id)
            & (ShopUserORM.user_id == form_data.user_id)
        )
    )
    return ResponseOK(detail="access revoked")


shops_router.include_router(shops_access_router)
