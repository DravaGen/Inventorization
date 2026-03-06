from uuid import UUID
from typing import Optional
from fastapi import HTTPException, status

from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import ItemORM, ItemShopORM, ItemQueueORM, ItemCartORM
from .schemas import ItemSchema, ItemResponse, ItemInShopSchema, \
    ItemShopForm, ItemQueueForm

from responses import ResponseOK


def get_items_quantity(
        items: list[ItemORM | ItemShopORM]
) -> list[Optional[ItemResponse]]:
    """
        Возвращает список информации о товаре и его общем количестве.
        Внутри происходит подсчет количества
    """

    response = []

    for item in items:

        if isinstance(item, ItemORM):
            item_data = item
            quantity = sum(
                shop.quantity
                for shop in item.shop_items
            )

        elif isinstance(item, ItemShopORM):
            item_data = item.item
            quantity = item.quantity

        else:
            raise ValueError(
                "the processing of calculating the quantity of goods " \
                "in get_items_quantity was not found."
            )

        response.append(
            ItemResponse(
                **ItemSchema.model_validate(item_data).model_dump(),
                quantity=quantity
            )
        )

    return response


def format_items_in_shop(
        items: list[ItemShopORM | ItemQueueORM]
) -> list[ItemInShopSchema]:
    """"""

    response = []

    for item in items:

        if isinstance(item, ItemShopORM):
            created_at = None
        else:
            created_at = item.created_at

        response.append(ItemInShopSchema(
            id=item.item_id,
            name=item.item.name,
            price=item.price,
            quantity=item.quantity,
            purchase_price=item.purchase_price,
            created_at=created_at
        ))

    return response



async def check_item_exists(
        item_id: UUID,
        db: AsyncSession
) -> bool:
    """Возвращает True если item существует"""

    return bool(await db.get(ItemORM, item_id))


async def raise_if_item_not_exists(
        item_id: UUID,
        db: AsyncSession
) -> None:
    """Поднимает ошибку если item не существует"""

    if not await check_item_exists(item_id, db):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="item not found"
        )


async def get_item_in_shop(
        item_id: UUID,
        shop_id: UUID,
        db: AsyncSession
) -> ItemShopORM | None:
    """Возрощяет True если item есть в магазине"""

    return await db.get(ItemShopORM, (item_id, shop_id))


async def raise_if_item_in_shop_not_found(
        item_id: UUID,
        shop_id: UUID,
        db: AsyncSession
) -> None:
    """Поднимает ошибку если item нет в магазине"""

    if not await get_item_in_shop(item_id, shop_id, db):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="item in shop not found"
        )


async def get_queues_in_shop(
        item_id: UUID,
        shop_id: UUID,
        db: AsyncSession
) -> list[ItemQueueORM]:
    """"""

    queues = await db.execute(
        select(ItemQueueORM)
        .where(
            (ItemQueueORM.shop_id == shop_id)
            & (ItemQueueORM.item_id == item_id)
        )
        .order_by(ItemQueueORM.created_at)
    )
    queues = queues.scalars().all()

    return list(queues)


async def add_item_shop(
        shop_id: UUID,
        form_data: ItemShopForm | ItemQueueForm,
        db: AsyncSession
) -> ResponseOK:
    """Добавляет товар в магазин или в очередь товаров в магазине """

    item_id = form_data.item_id
    await raise_if_item_not_exists(item_id, db)
    item_exists = await get_item_in_shop(item_id, shop_id, db)

    await db.execute(
        insert(ItemQueueORM if item_exists else ItemShopORM)
        .values(**form_data.model_dump(), shop_id=shop_id)
    )

    return ResponseOK(
        status_code=status.HTTP_202_ACCEPTED
            if item_exists else status.HTTP_201_CREATED,
        detail=f"Item added to {'queue' if item_exists else 'shop'}"
    )


def get_item_in_cart_conditions(
        user_id: UUID,
        shop_id: UUID,
        item_id: UUID,
):
    """Возвращает условия поиска товара в корзине"""

    return (
        (ItemCartORM.user_id == user_id)
        & (ItemCartORM.shop_id == shop_id)
        & (ItemCartORM.item_id == item_id)
    )


async def get_item_in_cart(
        user_id: UUID,
        shop_id: UUID,
        item_id: UUID,
        db: AsyncSession
) -> ItemCartORM | None:
    """Проверяет есть ли товар в корзине"""

    exists = await db.execute(
        select(ItemCartORM)
        .where(
            get_item_in_cart_conditions(
                user_id, shop_id, item_id
            )
        )
    )
    return exists.scalar()
