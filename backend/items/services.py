from uuid import UUID
from fastapi import HTTPException, status

from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import ItemORM, ItemShopORM, ItemQueueORM
from .schemas import ItemSchema, ItemResponse, ItemShopForm, ItemQueueForm

from shops.models import ShopCartORM

from responses import ResponseOK


def get_items_quantity(
        items: list[ItemORM | ItemShopORM]
) -> list[ItemResponse]:
    """
        Возвращает список информации о товаре и его общем количестве.
        Внутри происходит подсчет количества
    """

    response = []

    for item in items:

        if type(item) == ItemORM:
            item_data = item
            quantity = sum(
                shop.quantity
                for shop in item.items_in_shops
            )

        elif type(item) == ItemShopORM:
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
        status_code=202 if item_exists else 201,
        detail=f"Item added to {'queue' if item_exists else 'shop'}"
    )


def get_item_in_cart_conditions(
        user_id: UUID,
        shop_id: UUID,
        item_id: UUID,
):
    """Возвращает условия поиска товара в корзине"""

    return (
        (ShopCartORM.user_id == user_id)
        & (ShopCartORM.shop_id == shop_id)
        & (ShopCartORM.item_id == item_id)
    )


async def get_item_in_cart(
        user_id: UUID,
        shop_id: UUID,
        item_id: UUID,
        db: AsyncSession
) -> ShopCartORM | None:
    """Проверяет есть ли товар в корзине"""

    exists = await db.execute(
        select(ShopCartORM)
        .where(
            get_item_in_cart_conditions(
                user_id, shop_id, item_id
            )
        )
    )
    return exists.scalar()