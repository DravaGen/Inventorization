from typing import Optional
from fastapi import APIRouter, HTTPException, status

from sqlalchemy import insert, select, update
from sqlalchemy.orm import joinedload

from .models import ShopORM, ShopAccessORM
from .schemas import ShopResponse, ShopCrateForm, ShopCrateResponse, \
    ShopUpdateForm, UserAccessResponse, ShopAccessResponse, ShopAccessForm
from .services import grant_shop_access, check_shop_access, \
    delete_shop_access, get_shop_access

from responses import ResponseOK, ResponseDescriptions, ResponseDescription
from auth.services import CurrentUserID, CurrentShopID, \
    UserStatusISOwner, UserStatusISWorker, UserStatusISAdmin
from users.schemas import UserStatus
from users.services import get_user_by_id
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


@shops_router.patch(
    "/",
    dependencies=[UserStatusISOwner],
    responses=ResponseDescriptions((
        ResponseDescription(
            status_code=status.HTTP_404_NOT_FOUND,
            description="You cannot update the shop data"
        ),
    ))
)
async def update_shop(
        shop_id: CurrentShopID,
        form_data: ShopUpdateForm,
        db: SessionDep
) -> ResponseOK:
    """Обновляет магазин"""

    if not await db.get(ShopORM, shop_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You cannot update the shop data"
        )

    await db.execute(
        update(ShopORM)
        .values(**form_data.model_dump(exclude_unset=True))
        .where(ShopORM.id == shop_id)
    )

    return ResponseOK(detail="shop updated")


@shops_router.get(
    "/list",
    dependencies=[UserStatusISWorker]
)
async def get_shops(
        user_id: CurrentUserID,
        db: SessionDep
) -> list[Optional[ShopResponse]]:
    """Возвращает все магазины в зависимости от доступа"""

    user = await get_user_by_id(user_id, db)
    shops = []

    if (user.status == UserStatus.OWNER):
        shops = await db.execute(select(ShopORM))
        shops = shops.scalars()
    else:
        accesses = await db.execute(
            select(ShopAccessORM)
            .options(joinedload(ShopAccessORM.shop))
            .where(ShopAccessORM.user_id == user_id)
        )
        accesses = accesses.scalars().all()
        shops = [accesse.shop for accesse in accesses]

    return [ShopResponse.model_validate(x) for x in shops]


@shops_access_router.get(
    "/",
    dependencies=[UserStatusISAdmin]
)
async def get_access(
        shop_id: CurrentShopID,
        db: SessionDep
) -> ShopAccessResponse:
    """Возвращает пользователей которые имеют доступ в магазин"""

    access = await get_shop_access(shop_id, db)
    return access


@shops_access_router.post(
    "/",
    dependencies=[UserStatusISOwner],
    responses=ResponseDescriptions((
        ResponseDescription(
            status_code=status.HTTP_409_CONFLICT,
            description="Access rights cannot be granted " \
                "because they have already been granted"
        ),
    ))
)
async def grant_access(
        form_data: ShopAccessForm,
        db: SessionDep
)-> ShopAccessResponse:
    """Выдает доступ к магазину"""

    form_data: dict = form_data.model_dump()
    shop_id = form_data.get("shop_id")

    if await check_shop_access(**form_data, db=db):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Access rights cannot be granted"
        )

    await grant_shop_access(**form_data, db=db)
    access = await get_shop_access(shop_id, db)
    return access


@shops_access_router.delete(
    "/",
    dependencies=[UserStatusISOwner]
)
async def delete_access(
        form_data: ShopAccessForm,
        db: SessionDep
)-> ShopAccessResponse:
    """Удаляет доступ к магазину"""

    form_data: dict = form_data.model_dump()
    await delete_shop_access(**form_data, db=db)

    shop_id = form_data.get("shop_id")
    access = await get_shop_access(shop_id, db)
    return access


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
