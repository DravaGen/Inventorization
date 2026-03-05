from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import UserORM


async def get_user(
        email: str,
        db: AsyncSession
) -> UserORM | None:
    """Повращает пользователя по email"""

    user = await db.execute(
        select(UserORM)
        .where(UserORM.email == email)
    )
    return user.scalar()
