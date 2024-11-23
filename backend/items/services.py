from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from .models import ItemORM, ItemShopORM
from .schemas import ItemSchema, ItemResponse


def format_items_quantity(
        items: list[ItemORM]
) -> list[ItemResponse]:
    """
        Возвращает список информации о товаре и его общем количестве.
        Внутри происходит подсчет количества
    """

    response = []

    for item in items:
        shops_quantity = sum(
            shop.quantity
            for shop in item.items_in_shops
        )
        queue_quantity = sum(
            queue.quantity
            for shop in item.items_in_shops
            for queue in shop.queues
        )
        total_quantity = shops_quantity + queue_quantity

        response.append(
            ItemResponse(
                **ItemSchema.model_validate(item).model_dump(),
                quantity=total_quantity
            )
        )

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


async def check_item_in_shop_exists(
        item_id: UUID,
        shop_id: UUID,
        db: AsyncSession
) -> bool:
    """Возрощяет True если item есть в магазине"""

    return bool(await db.get(ItemShopORM, (item_id, shop_id)))


async def raise_if_item_in_shop_not_found(
        item_id: UUID,
        shop_id: UUID,
        db: AsyncSession
) -> None:
    """Поднимает ошибку если item нет в магазине"""

    if not await check_item_in_shop_exists(item_id, shop_id, db):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="item in shop not found"
        )
