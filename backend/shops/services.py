from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import ShopCartORM


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


async def check_item_in_cart(
        user_id: UUID,
        shop_id: UUID,
        item_id: UUID,
        db: AsyncSession
) -> bool:
    """Проверяет есть ли товар в корзине"""

    exists = await db.execute(
        select(ShopCartORM)
        .where(
            get_item_in_cart_conditions(
                user_id, shop_id, item_id
            )
        )
    )
    return bool(exists.scalar())
