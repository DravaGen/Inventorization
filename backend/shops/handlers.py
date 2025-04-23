from typing import Optional
from fastapi import APIRouter, HTTPException

from sqlalchemy import insert, select

from .models import ShopORM, ShopAccessORM
from .schemas import ShopResponse, ShopCrateForm, ShopCrateResponse, \
    UserAccessResponse, ShopAccessResponse, ShopAccessForm
from .services import grant_shop_access, check_shop_access, \
    delete_shop_access

from responses import ResponseOK, ResponseDescriptions, ResponseDescription
from auth.services import CurrentUserID, CurrentShopID, \
    UserStatusISOwner, UserStatusISWorker
from databases.sqlalchemy import SessionDep


shops_router = APIRouter()
shops_access_router = APIRouter(
    prefix="/access",
    tags=["Shops Access"]
)


@shops_router.post(
    "/",
    dependencies=[UserStatusISOwner]
)
async def create_shop(
        user_id: CurrentUserID,
        form_data: ShopCrateForm,
        db: SessionDep
) -> ShopCrateResponse:
    """Создает магазин"""

    shop = await db.execute(
        insert(ShopORM)
        .values(**form_data.model_dump())
        .returning(ShopORM)
    )
    shop = shop.scalar()

    await grant_shop_access(user_id, shop.id, db)
    return ShopCrateResponse.model_validate(shop)


@shops_router.get(
    "/list",
    dependencies=[UserStatusISOwner]
)
async def get_shops(
        db: SessionDep
) -> list[Optional[ShopResponse]]:
    """Возвращает все магазины"""

    shops = await db.execute(select(ShopORM))
    return [
        ShopResponse.model_validate(x)
        for x in shops.scalars()
    ]


@shops_access_router.get(
    "/",
    dependencies=[UserStatusISOwner]
)
async def get_access(
        shop_id: CurrentShopID,
        db: SessionDep
) -> ShopAccessResponse:
    """Возвращает пользователей которые имеют доступ в магазин"""

    users = await db.execute(
        select(ShopAccessORM.user_id)
        .where(ShopAccessORM.shop_id == shop_id)
    )
    return ShopAccessResponse(
        shop_id=shop_id,
        user_ids=users.scalars().all()
    )


@shops_access_router.post(
    "/",
    dependencies=[UserStatusISOwner],
    responses=ResponseDescriptions((
        ResponseDescription(
            status_code=409,
            description="Access rights cannot be granted " \
                "because they have already been granted"
        ),
    ))
)
async def grant_access(
        form_data: ShopAccessForm,
        db: SessionDep
)-> ResponseOK:
    """Выдает доступ к магазину"""

    form_data: dict = form_data.model_dump()
    if await check_shop_access(**form_data, db=db):
        raise HTTPException(
            status_code=409,
            detail="Access rights cannot be granted"
        )

    await grant_shop_access(**form_data, db=db)
    return ResponseOK(detail="access granted")


@shops_access_router.delete(
    "/",
    dependencies=[UserStatusISOwner]
)
async def delete_access(
        form_data: ShopAccessForm,
        db: SessionDep
)-> ResponseOK:
    """Удаляет доступ к магазину"""

    await delete_shop_access(**form_data.model_dump(), db=db)
    return ResponseOK(detail="access revoked")


@shops_access_router.get(
    "/self",
    dependencies=[UserStatusISWorker]
)
async def get_self_access(
        user_id: CurrentUserID,
        db: SessionDep
)-> UserAccessResponse:
    """Возвращает пользователей которые прикреплены к магазину"""

    shops = await db.execute(
        select(ShopAccessORM.shop_id)
        .where(ShopAccessORM.user_id == user_id)
    )
    return UserAccessResponse(
        user_id=user_id,
        shop_ids=shops.scalars().all()
    )


shops_router.include_router(shops_access_router)
