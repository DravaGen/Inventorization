from typing import Optional
from fastapi import APIRouter, HTTPException, status

from sqlalchemy import insert, select, update
from sqlalchemy.orm import joinedload

from .models import ShopORM, ShopAccessORM
from .schemas import ShopResponse, ShopCreateForm, ShopUpdateForm, \
    UserAccessResponse, ShopAccessResponse, ShopAccessForm

from responses import ResponseOK, ResponseDescriptions, ResponseDescription
from auth.services import CurrentUser, CurrentShop, \
    UserStatusISOwner, UserStatusISWorker, UserStatusISAdmin
from users.models import UserORM
from users.schemas import UserStatus
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
        user: CurrentUser,
        form_data: ShopCreateForm,
        db: SessionDep
) -> ShopResponse:
    """Создает магазин"""

    result = await db.execute(
        insert(ShopORM)
        .values(**form_data.model_dump())
        .returning(ShopORM)
    )
    shop = result.scalar_one()

    await shop.grant_access(user.id, db)
    return ShopResponse.model_validate(shop)


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
        shop: CurrentShop,
        form_data: ShopUpdateForm,
        db: SessionDep
) -> ResponseOK:
    """Обновляет магазин"""

    await db.execute(
        update(ShopORM)
        .values(**form_data.model_dump(exclude_unset=True))
        .where(ShopORM.id == shop.id)
    )

    return ResponseOK(detail="shop updated")


@shops_router.get(
    "/list",
    dependencies=[UserStatusISWorker]
)
async def get_shops(
        user: CurrentUser,
        db: SessionDep
) -> list[Optional[ShopResponse]]:
    """Возвращает все магазины в зависимости от доступа"""

    shops = []

    if (user.status == UserStatus.OWNER):
        shops = await db.execute(
            select(ShopORM)
            .order_by(ShopORM.id)
        )
        shops = shops.scalars()
    else:
        accesses = await db.execute(
            select(ShopAccessORM)
            .options(joinedload(ShopAccessORM.shop))
            .where(ShopAccessORM.user_id == user.id)
            .order_by(ShopAccessORM.shop_id)
        )
        accesses = accesses.scalars().all()
        shops = [accesse.shop for accesse in accesses]

    return [ShopResponse.model_validate(x) for x in shops]


@shops_access_router.get(
    "/",
    dependencies=[UserStatusISAdmin]
)
async def get_access(
        shop: CurrentShop,
        db: SessionDep
) -> ShopAccessResponse:
    """Возвращает пользователей которые имеют доступ в магазин"""

    users = await db.execute(
        select(ShopAccessORM.user_id)
        .where(ShopAccessORM.shop_id == shop.id)
        .order_by(ShopAccessORM.user_id)
    )
    return ShopAccessResponse(
        shop_id=shop.id,
        user_ids=list(users.scalars().all())
    )


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
)-> ResponseOK:
    """Выдает доступ к магазину"""

    shop = await ShopORM.get_by_id(form_data.shop_id, db)
    user_id = form_data.user_id

    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="shop not found"
        )

    if shop.check_access(user_id, db):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Access rights cannot be granted"
        )

    await shop.grant_access(user_id, db)
    return ResponseOK(detail="granted access")


@shops_access_router.delete(
    "/",
    dependencies=[UserStatusISOwner]
)
async def delete_access(
        form_data: ShopAccessForm,
        db: SessionDep
)-> ResponseOK:
    """Удаляет доступ к магазину"""

    shop = await ShopORM.get_by_id(form_data.shop_id, db)
    user_id = form_data.user_id

    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="shop not found"
        )

    await shop.revoke_access(user_id, db)

    return ResponseOK(detail="revoked access")


@shops_access_router.get(
    "/self",
    dependencies=[UserStatusISWorker]
)
async def get_self_access(
        user: CurrentUser,
        db: SessionDep
)-> UserAccessResponse:
    """Возвращает пользователей которые прикреплены к магазину"""

    shops = await db.execute(
        select(ShopAccessORM.shop_id)
        .where(ShopAccessORM.user_id == user.id)
        .order_by(ShopAccessORM.shop_id)
    )
    return UserAccessResponse(
        user_id=user.id,
        shop_ids=list(shops.scalars().all())
    )


shops_router.include_router(shops_access_router)
