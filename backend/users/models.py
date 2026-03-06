import uuid
import datetime
from uuid import UUID

from sqlalchemy import String, Enum, func, select
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.asyncio import AsyncSession

from .schemas import UserStatus
from databases.sqlalchemy import Base, get_enum_values


class UserORM(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=func.gen_random_uuid()
    )
    email: Mapped[str] = mapped_column(String(100), unique=True)
    status: Mapped[UserStatus] = mapped_column(
        Enum(UserStatus, values_callable=get_enum_values)
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        server_default=func.now()
    )

    shops = relationship(
        "ShopORM",
        secondary="shop_access",
        back_populates="users",
        overlaps="shop_access"
    )

    @classmethod
    async def get_by_id(cls, user_id: UUID, db: AsyncSession) -> "UserORM | None":
        return await db.get(cls, user_id)

    @classmethod
    async def get_by_email(cls, email: str, db: AsyncSession) -> "UserORM | None":
        result = await db.execute(select(cls).where(cls.email == email))
        return result.scalar()
