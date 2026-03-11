from datetime import datetime
from uuid import UUID
from typing import Sequence

from sqlalchemy import String, ForeignKey, PrimaryKeyConstraint, \
    CheckConstraint, ForeignKeyConstraint, func, select, delete
from sqlalchemy.orm import Mapped, mapped_column, relationship, \
    joinedload
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
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now()
    )

    users = relationship(
        "UserORM",
        secondary="shop_access",
        back_populates="shops",
        overlaps="shop_access"
    )
    shop_items = relationship("ShopItemORM", back_populates="shop")
    shop_access = relationship(
        "ShopAccessORM",
        back_populates="shop",
        overlaps="users"
    )

    @classmethod
    async def get_by_id(cls, shop_id: UUID, db: AsyncSession) -> "ShopORM | None":
        return await db.get(cls, shop_id)

    @classmethod
    async def create(cls, data: dict, db: AsyncSession) -> "ShopORM":
        shop = cls(**data)
        db.add(shop)
        await db.flush()
        return shop

    async def update(self, data: dict) -> None:
        for key, value in data.items():
            setattr(self, key, value)

    @classmethod
    async def get_all(cls, db: AsyncSession) -> Sequence["ShopORM"]:
        result = await db.execute(select(cls).order_by(cls.id))
        return result.scalars().all()

    @classmethod
    async def get_user_shops(
        cls,
        user_id: UUID,
        db: AsyncSession
    ) -> Sequence["ShopORM"]:
        result = await db.execute(
            select(cls)
            .options(joinedload(cls.shop_access))
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
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now()
    )

    shop = relationship(
        "ShopORM",
        back_populates="shop_access",
        overlaps="shops,users"
    )

    @classmethod
    async def grant_access(cls, shop_id: UUID, user_id: UUID, db: AsyncSession) -> None:
        access = cls(shop_id=shop_id, user_id=user_id)
        db.add(access)

    @classmethod
    async def check_access(cls, shop_id: UUID, user_id: UUID, db: AsyncSession) -> bool:
        result = await db.execute(
            select(cls)
            .where((cls.shop_id == shop_id) & (cls.user_id == user_id))
        )
        return result.scalar_one_or_none() is not None

    @classmethod
    async def revoke_access(cls, shop_id: UUID, user_id: UUID, db: AsyncSession) -> None:
        await db.execute(
            delete(cls)
            .where((cls.shop_id == shop_id) & (cls.user_id == user_id))
        )

    @classmethod
    async def get_user_ids(cls, shop_id: UUID, db: AsyncSession) -> Sequence[UUID]:
        result = await db.execute(
            select(cls.user_id)
            .where(cls.shop_id == shop_id)
            .order_by(cls.user_id)
        )
        return result.scalars().all()

    @classmethod
    async def get_shop_ids(cls, user_id: UUID, db: AsyncSession) -> Sequence[UUID]:
        result = await db.execute(
            select(cls.shop_id)
            .where(cls.user_id == user_id)
            .order_by(cls.shop_id)
        )
        return result.scalars().all()


class ShopItemORM(Base):
    __tablename__ = "shop_items"

    item_id: Mapped[UUID] = mapped_column(ForeignKey("items.id"))
    shop_id: Mapped[UUID] = mapped_column(ForeignKey("shops.id"))
    price: Mapped[int]
    quantity: Mapped[int]
    purchase_price: Mapped[int]

    item = relationship("ItemORM", back_populates="shop_items")
    shop = relationship("ShopORM", back_populates="shop_items")
    cart = relationship("ShopCartORM", back_populates="shop_items")

    __table_args__ = (
        PrimaryKeyConstraint(item_id, shop_id),
        CheckConstraint("price > 0", name="check_price_positive"),
        CheckConstraint("quantity >= 0", name="check_quantity")
    )

    @classmethod
    async def get(
        cls,
        item_id: UUID,
        shop_id: UUID,
        db: AsyncSession
    ) -> "ShopItemORM | None":
        return await db.get(cls, (item_id, shop_id))

    @classmethod
    async def check_exists(
        cls,
        item_id: UUID,
        shop_id: UUID,
        db: AsyncSession
    ) -> bool:
        return await cls.get(item_id, shop_id, db) is not None

    @classmethod
    async def add(
        cls,
        shop_id: UUID,
        data: dict,
        db: AsyncSession
    ) -> None:
        item = cls(**data, shop_id=shop_id)
        db.add(item)

    @classmethod
    async def get_all(cls, shop_id: UUID, db: AsyncSession) -> Sequence["ShopItemORM"]:
        result = await db.execute(
            select(cls)
            .options(joinedload(cls.item))
            .where(cls.shop_id == shop_id)
            .order_by(cls.item_id)
        )
        return result.unique().scalars().all()

    @classmethod
    async def delete(cls, item_id: UUID, shop_id: UUID, db: AsyncSession) -> None:
        await db.execute(
            delete(cls)
            .where((cls.item_id == item_id) & (cls.shop_id == shop_id))
        )


class ShopQueueORM(Base):
    __tablename__ = "shop_queues"

    item_id: Mapped[UUID] = mapped_column(ForeignKey("items.id"))
    shop_id: Mapped[UUID] = mapped_column(ForeignKey("shops.id"))
    price: Mapped[int]
    quantity: Mapped[int]
    purchase_price: Mapped[int]
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now()
    )

    item = relationship("ItemORM", back_populates="shop_queues")

    __table_args__ = (
        PrimaryKeyConstraint(item_id, shop_id, created_at),
    )

    @classmethod
    async def add(
        cls,
        shop_id: UUID,
        data: dict,
        db: AsyncSession
    ) -> None:
        item = cls(**data, shop_id=shop_id)
        db.add(item)

    @classmethod
    async def get_all(cls, shop_id: UUID, db: AsyncSession) -> Sequence["ShopQueueORM"]:
        result = await db.execute(
            select(cls)
            .options(joinedload(cls.item))
            .where(cls.shop_id == shop_id)
            .order_by(cls.item_id)
        )
        return result.unique().scalars().all()

    @classmethod
    async def get_next(cls, item_id: UUID, shop_id: UUID, db: AsyncSession) -> "ShopQueueORM | None":
        result = await db.execute(
            select(cls)
            .where((cls.item_id == item_id) & (cls.shop_id == shop_id))
            .order_by(cls.created_at.asc())
            .limit(1)
        )

        return result.scalar_one_or_none()


    @classmethod
    async def delete(
        cls,
        shop_id: UUID,
        item_id: UUID,
        created_at: datetime,
        db: AsyncSession
    ) -> None:
        await db.execute(
            delete(cls)
            .where(
                (cls.shop_id == shop_id)
                & (cls.item_id == item_id)
                & (cls.created_at == created_at)
            )
        )


class ShopCartORM(Base):
    __tablename__ = "shop_cart"

    shop_id: Mapped[UUID] = mapped_column()
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    item_id: Mapped[UUID] = mapped_column()
    quantity: Mapped[int] = mapped_column(server_default="1")

    shop_items = relationship("ShopItemORM", back_populates="cart")

    __table_args__ = (
        PrimaryKeyConstraint(shop_id, user_id, item_id),
        CheckConstraint("quantity > 0", name="check_quantity_positive"),
        ForeignKeyConstraint(
            ["item_id", "shop_id"],
            ["shop_items.item_id", "shop_items.shop_id"]
        )
    )

    @classmethod
    async def get(
        cls,
        item_id: UUID,
        user_id: UUID,
        shop_id: UUID,
        db: AsyncSession
    ) -> "ShopCartORM | None":
        return await db.get(cls, (shop_id, user_id, item_id))

    @classmethod
    async def get_all(
        cls,
        shop_id: UUID,
        user_id: UUID,
        db: AsyncSession
    ) -> Sequence["ShopCartORM"]:

        result = await db.execute(
            select(cls)
            .options(joinedload(cls.shop_items).joinedload(ShopItemORM.item))
            .where((cls.user_id == user_id) & (cls.shop_id == shop_id))
            .order_by(ShopCartORM.item_id)
        )
        return result.scalars().unique().all()

    @classmethod
    async def create(
        cls,
        data: dict,
        shop_id: UUID,
        user_id: UUID,
        db: AsyncSession
    ) -> "ShopCartORM":
        item = cls(**data, shop_id=shop_id, user_id=user_id)
        db.add(item)
        await db.flush()
        return item

    @classmethod
    async def delete_all(
        cls,
        shop_id: UUID,
        user_id: UUID,
        db: AsyncSession
    ) -> None:
        await db.execute(
            delete(cls)
            .where((cls.shop_id == shop_id) & (cls.user_id == user_id))
        )