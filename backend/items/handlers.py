from typing import Optional
from fastapi import APIRouter, Query

from sqlalchemy import insert, select, func
from sqlalchemy.orm import joinedload, contains_eager

from .models import ItemORM, ItemShopORM, ItemQueueORM, ItemSoldORM
from .schemas import ItemInitForm, ItemInitResponse, ItemResponse, ItemResponse, \
    ItemSoldResoinse, ItemReceivingForm
from .services import format_items_quantity, raise_if_item_not_exists, \
    check_item_in_shop_exists


from responses import ResponseOK
from auth.services import CurrentShopID, UserStatusISWorker, UserStatusISAdmin
from databases.sqlalchemy import SessionDep, convert_query_to_list_dicts


items_router = APIRouter()


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
    "/list",
    dependencies=[UserStatusISAdmin]
)
async def get_list_items(
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


@items_router.get(
    "/sold",
    dependencies=[UserStatusISAdmin]
)
async def get_sold_items(
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


items_in_shops_router = APIRouter(
    prefix="/shop",
    tags=["Items In Shops"],
    dependencies=[UserStatusISWorker]
)


@items_in_shops_router.post("/")
async def receiving_items_to_shop(
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


@items_in_shops_router.get("/list")
async def get_items_in_shop(
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


items_router.include_router(items_in_shops_router)
