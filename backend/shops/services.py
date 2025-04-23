from uuid import UUID
from sqlalchemy import insert, select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from .models import ShopAccessORM


async def grant_shop_access(
        user_id: UUID,
        shop_id: UUID,
        db: AsyncSession
) -> None:
    """Выдает доступ к магазину """

    await db.execute(
        insert(ShopAccessORM)
        .values(
            user_id=user_id,
            shop_id=shop_id
        )
    )


async def check_shop_access(
        user_id: UUID,
        shop_id: UUID,
        db: AsyncSession
) -> ShopAccessORM | None:
    """Возвращает есть ли доступ к магазину"""

    access = await db.execute(
        select(ShopAccessORM)
        .where(
            (ShopAccessORM.user_id == user_id)
            & (ShopAccessORM.shop_id == shop_id)
        )
    )
    return access.scalar_one_or_none()


async def delete_shop_access(
        user_id: UUID,
        shop_id: UUID,
        db: AsyncSession
) -> None:
    """Удаляет доступ к магазину"""

    await db.execute(
        delete(ShopAccessORM)
        .where(
            (ShopAccessORM.user_id == user_id)
            % (ShopAccessORM.shop_id == shop_id)
        )
    )
