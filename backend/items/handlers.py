from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from sqlalchemy import insert, select, update, delete, func
from sqlalchemy.orm import joinedload, contains_eager
from sqlalchemy.exc import IntegrityError

from .models import ItemORM, ItemShopORM, ItemQueueORM, ItemSoldORM
from .schemas import ItemInitForm, ItemInitResponse, ItemDeleteForm, ItemResponse, \
    ItemSoldResoinse, ItemReceivingForm
from .services import format_items_quantity, raise_if_item_not_exists, \
    check_item_in_shop_exists

from shops.models import ShopCartORM
from shops.schemas import ShopCartItemResponse, ShopCartItemForm
from shops.services import check_item_in_cart


from responses import ResponseOK
from auth.services import CurrentShopID,CurrentUserID, UserStatusISAdmin
from databases.sqlalchemy import SessionDep, convert_query_to_list_dicts


items_router = APIRouter()
item_shop_route = APIRouter(
    prefix="/shop",
    tags=["Items In Shop"]
)
item_cart_route = APIRouter(
    prefix="/cart",
    tags=["Items In Cart"]
)


@items_router.post(
    "/",
    dependencies=[UserStatusISAdmin]
)
async def add_item(
        form_data: ItemInitForm,
        db: SessionDep
) -> ItemInitResponse:
    """Добавляет товар и описание о нем"""

    item_id = await db.execute(
        insert(ItemORM)
        .values(**form_data.model_dump())
        .returning("id")
    )

    return ItemInitResponse(item_id=item_id.scalar())


@items_router.get(
    "/",
    dependencies=[UserStatusISAdmin]
)
async def get_items(
        db: SessionDep
) -> list[Optional[ItemResponse]]:
    """Возвращает все товары"""

    items = await db.execute(
        select(ItemORM)
        .options(
            joinedload(ItemORM.items_in_shops)
            .joinedload(ItemShopORM.queues)
        )
    )

    return format_items_quantity(items.unique().scalars().all())


@items_router.delete(
    "/",
    dependencies=[UserStatusISAdmin]
)
async def del_item(
        form_data: ItemDeleteForm,
        db: SessionDep
) -> ResponseOK:
    """Добавляет товар и описание о нем"""

    try:
        await db.execute(
            delete(ItemORM)
            .where(ItemORM.id == form_data.item_id)
        )
        return ResponseOK(detail="item deleted")

    except IntegrityError:
        return HTTPException(
            status_code=409,
            detail="It is not possible to delete an item " \
                   "because it is associated with other data."
        )


@items_router.get(
    "/sold",
    dependencies=[UserStatusISAdmin]
)
async def get_solds(
        db: SessionDep,
        offset: int = Query(0, ge=0),
        limit: int = Query(7, ge=1, le=31)
) -> list[Optional[ItemSoldResoinse]]:
    """Возвращает статистику о продаже"""

    sold_items = await db.execute(
        select(
            func.date(ItemSoldORM.created_at).label("date"),
            func.count().label("count"),
            func.sum(ItemSoldORM.income).label("income")
        )
        .group_by(func.date(ItemSoldORM.created_at))
        .offset(offset)
        .limit(limit)
    )
    return convert_query_to_list_dicts(ItemSoldResoinse, sold_items)


@item_shop_route.post(
    "/",
    dependencies=[UserStatusISAdmin]
)
async def add_shop_item(

):
    raise NotImplementedError


@item_shop_route.get(
    "/"
)
async def get_shop_items(
        shop_id: CurrentShopID,
        db: SessionDep
) -> list[Optional[ItemResponse]]:
    """Возвращает все товары которые есть в магазине"""

    items = await db.execute(
        select(ItemORM)
        .join(ItemORM.items_in_shops)
        .options(
            contains_eager(ItemORM.items_in_shops)
            .joinedload(ItemShopORM.queues)
        )
        .where(ItemShopORM.shop_id == shop_id)
    )

    return format_items_quantity(items.unique().scalars().all())


@item_shop_route.delete(
    "/",
    dependencies=[UserStatusISAdmin]
)
async def del_shop_item(

):
    raise NotImplementedError


@item_shop_route.post("/queue")
async def add_shop_queue(
        shop_id: CurrentShopID,
        form_data: ItemReceivingForm,
        db: SessionDep,
) -> ResponseOK:
    """
        Принимает товар в магазин
        Если товара в магазине нет, добавляет его, иначе – ставит в очередь.
    """

    item_id = form_data.item_id
    await raise_if_item_not_exists(item_id, db)
    item_exists = await check_item_in_shop_exists(item_id, shop_id, db)

    await db.execute(
        insert(ItemQueueORM if item_exists else ItemShopORM)
        .values(**form_data.model_dump(), shop_id=shop_id)
    )

    return ResponseOK(
        detail=f"Item added to {'queue' if item_exists else 'shop'}"
    )



@item_cart_route.post(
    "/"
)
async def add_cart_item(
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


@item_cart_route.get(
    "/",
    dependencies=[UserStatusISAdmin]
)
async def get_cart_items(
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


@item_cart_route.delete(
    "/"
)
async def del_cart_item(
        user_id: CurrentUserID,
        shop_id: CurrentShopID,
        form_data: ShopCartItemForm,
        db: SessionDep
) -> ResponseOK:
    """Удаляет товар из корзины"""

    raise NotImplementedError
    return ResponseOK(detail="item deleted from cart")


@item_cart_route.delete(
    "/all"
)
async def del_cart_all_items(
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


@item_cart_route.post(
    "/confirmm"
)
async def confirm_cart(
        user_id: CurrentUserID,
        shop_id: CurrentShopID,
        db: SessionDep
) -> ResponseOK:
    """Подтверждает покупку"""

    raise NotImplementedError
    return ResponseOK(detail="purchase been confirmed")


items_router.include_router(item_shop_route)
items_router.include_router(item_cart_route)
