from uuid import UUID
from sqlalchemy import insert, select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from .models import ShopUserORM


async def grant_shop_access(
        user_id: UUID,
        shop_id: UUID,
        db: AsyncSession
) -> None:
    """Выдает доступ к магазину """

    await db.execute(
        insert(ShopUserORM)
        .values(
            user_id=user_id,
            shop_id=shop_id
        )
    )


async def check_shop_access(
        user_id: UUID,
        shop_id: UUID,
        db: AsyncSession
) -> ShopUserORM | None:
    """Возвращает есть ли доступ к магазину"""

    access = await db.execute(
        select(ShopUserORM)
        .where(
            (ShopUserORM.user_id == user_id)
            & (ShopUserORM.shop_id == shop_id)
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
        delete(ShopUserORM)
        .where(
            (ShopUserORM.user_id == user_id)
            % (ShopUserORM.shop_id == shop_id)
        )
    )
