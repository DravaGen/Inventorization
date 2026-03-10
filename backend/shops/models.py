import datetime
from uuid import UUID
from typing import Sequence
from pydantic import BaseModel

from sqlalchemy import String, ForeignKey, func, select, delete
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.asyncio import AsyncSession

from databases.sqlalchemy import Base


class ShopORM(Base):
    __tablename__ = "shops"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        server_default=func.gen_random_uuid()
    )
    name: Mapped[str] = mapped_column(String(32))
    address: Mapped[str] = mapped_column(String(64))
    created_at: Mapped[datetime.datetime] = mapped_column(
        server_default=func.now()
    )

    users = relationship(
        "UserORM",
        secondary="shop_access",
        back_populates="shops",
        overlaps="shop_access"
    )
    shop_items = relationship("ItemShopORM", back_populates="shop")
    shop_access = relationship(
        "ShopAccessORM",
        back_populates="shop",
        overlaps="users"
    )

    @classmethod
    async def get_by_id(cls, shop_id: UUID, db: AsyncSession) -> "ShopORM | None":
        return await db.get(cls, shop_id)

    async def grant_access(self, user_id: UUID, db: AsyncSession) -> None:
        access = ShopAccessORM(shop_id=self.id, user_id=user_id)
        db.add(access)
        await db.flush()

    async def check_access(self, user_id: UUID, db: AsyncSession) -> bool:
        result = await db.execute(
            select(ShopAccessORM)
            .where(
                (ShopAccessORM.shop_id == self.id)
                & (ShopAccessORM.user_id == user_id)
            )
        )
        return result.scalar_one_or_none() is not None

    async def revoke_access(
        self,
        user_id: UUID,
        db: AsyncSession
    ) -> None:
        await db.execute(
            delete(ShopAccessORM)
            .where(
                (ShopAccessORM.shop_id == self.id)
                & (ShopAccessORM.user_id == user_id)
            )
        )
        await db.flush()

    async def list_user_ids(self, db: AsyncSession) -> list[UUID]:
        result = await db.execute(
            select(ShopAccessORM.user_id)
            .where(ShopAccessORM.shop_id == self.id)
            .order_by(ShopAccessORM.user_id)
        )
        return list(result.scalars().all())

    @staticmethod
    async def list_shop_ids(user_id: UUID, db: AsyncSession) -> list[UUID]:
        result = await db.execute(
            select(ShopAccessORM.shop_id)
            .where(ShopAccessORM.user_id == user_id)
            .order_by(ShopAccessORM.shop_id)
        )
        return list(result.scalars().all())

    @classmethod
    async def create(
        cls,
        schema: BaseModel,
        db: AsyncSession
    ) -> "ShopORM":
        shop = cls(**schema.model_dump())
        db.add(shop)
        await db.flush()

        return shop

    async def update(
        self,
        schema: BaseModel,
        db: AsyncSession
    ) -> None:
        data = schema.model_dump(exclude_unset=True)

        for key, value in data.items():
            setattr(self, key, value)

        await db.flush()

    @classmethod
    async def get_all(cls, db: AsyncSession) -> Sequence["ShopORM"]:
        result = await db.execute(select(cls).order_by(cls.id))
        return result.scalars().all()

    @classmethod
    async def get_for_user(
        cls,
        user_id: UUID,
        db: AsyncSession
    ) -> Sequence["ShopORM"]:
        result = await db.execute(
            select(cls)
            .join(ShopAccessORM)
            .where(ShopAccessORM.user_id == user_id)
            .order_by(cls.id)
        )
        return result.scalars().all()


class ShopAccessORM(Base):
    __tablename__ = "shop_access"

    shop_id: Mapped[UUID] = mapped_column(
        ForeignKey("shops.id"), primary_key=True
    )
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id"), primary_key=True
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        server_default=func.now()
    )

    shop = relationship(
        "ShopORM",
        back_populates="shop_access",
        overlaps="shops,users"
    )
