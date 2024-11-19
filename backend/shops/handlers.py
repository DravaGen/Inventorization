
from typing import Optional
from fastapi import APIRouter

from sqlalchemy import insert, select, update, delete

from .models import ShopORM, ShopUserORM, ShopCartORM
from .schemas import ShopResponse, ShopCrateForm, ShopCrateResponse, \
    ShopAccessResponse, ShopAccessForm, ShopCartItemForm, \
    ShopCartItemResponse
from .services import check_item_in_cart

from auth.services import CurrentUserID, CurrentShopID, UserStatusISOwner
from databases.sqlalchemy import SessionDep, convert_query_to_list_dicts
from responses import ResponseOK


shops_router = APIRouter()


@shops_router.post(
    "/",
    dependencies=[UserStatusISOwner]
)
async def create_shop(
        form_data: ShopCrateForm,
        db: SessionDep
) -> ShopCrateResponse:
    """Создает магазин. Статус OWNER"""

    shop = await db.execute(
        insert(ShopORM)
        .values(**form_data.model_dump())
        .returning(ShopORM)
    )
    return ShopCrateResponse.model_validate(shop.scalar())


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


shops_cards_router = APIRouter(
    prefix="/cards",
    tags=["Shops Cards"]
)


@shops_cards_router.get("/")
async def get_items_cart(
        user_id: CurrentUserID,
        shop_id: CurrentShopID,
        db: SessionDep
) -> list[Optional[ShopCartItemResponse]]:
    """Возвращает товары из корзины"""

    cart = await db.execute(
        select(ShopCartORM.item_id, ShopCartORM.quantity)
        .where(
            (ShopCartORM.user_id == user_id)
            & (ShopCartORM.shop_id == shop_id)
        )
    )
    return convert_query_to_list_dicts(ShopCartItemResponse, cart)


@shops_cards_router.post("/")
async def add_item(
        user_id: CurrentUserID,
        shop_id: CurrentShopID,
        form_data: ShopCartItemForm,
        db: SessionDep
) -> ResponseOK:
    """Добавляет товар в корзину"""

    if await check_item_in_cart(user_id, shop_id, form_data.item_id, db):
        await db.execute(
            update(ShopCartORM)
            .where(ShopCartORM.item_id == form_data.item_id)
            .values(quantity=ShopCartORM.quantity + form_data.quantity)
        )

    else:
        await db.execute(
            insert(ShopCartORM)
            .values(
                shop_id=shop_id,
                user_id=user_id,
                **form_data.model_dump()
            )
        )

    return ResponseOK(detail="item added to cart")


@shops_cards_router.delete("/")
async def delete_item(
        user_id: CurrentUserID,
        shop_id: CurrentShopID,
        form_data: ShopCartItemForm,
        db: SessionDep
) -> ResponseOK:
    """Удаляет товар из корзины"""

    raise NotImplementedError
    return ResponseOK(detail="item deleted from cart")


@shops_cards_router.delete("/clear")
async def clear_cart(
        user_id: CurrentUserID,
        shop_id: CurrentShopID,
        db: SessionDep
) -> ResponseOK:
    """Удаляет все товары из корзины"""

    await db.execute(
        delete(ShopCartORM)
        .where(
            (ShopCartORM.shop_id == shop_id)
            & (ShopCartORM.user_id == user_id)
        )
    )
    return ResponseOK(detail="cleaned cart")


@shops_cards_router.post("/confirm_purchase")
async def confirm_purchase(
        user_id: CurrentUserID,
        shop_id: CurrentShopID,
        db: SessionDep
) -> ResponseOK:
    """Подтверждает покупку"""

    raise NotImplementedError
    return ResponseOK(detail="purchase been confirmed")


shops_router.include_router(shops_access_router)
shops_router.include_router(shops_cards_router)
