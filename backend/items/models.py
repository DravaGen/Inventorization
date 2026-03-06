import datetime
from uuid import UUID

from sqlalchemy import String, BigInteger, ForeignKey, CheckConstraint, \
    PrimaryKeyConstraint, func, ForeignKeyConstraint, select
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.asyncio import AsyncSession

from databases.sqlalchemy import Base


class ItemORM(Base):
    __tablename__ = "items"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        server_default=func.gen_random_uuid()
    )
    name: Mapped[str] = mapped_column(String(50))

    items_sold = relationship("ItemSoldORM", back_populates="item")
    shop_items = relationship("ItemShopORM", back_populates="item")
    shop_queues = relationship("ItemQueueORM", back_populates="item")


    @classmethod
    async def get_by_id(cls, item_id: UUID, db: AsyncSession) -> "ItemORM | None":
        return await db.get(cls, item_id)


    @classmethod
    async def check_exists(cls, item_id: UUID, db: AsyncSession) -> bool:
        return cls.get_by_id(item_id, db) is not None


class ItemShopORM(Base):
    __tablename__ = "shop_items"

    item_id: Mapped[UUID] = mapped_column(ForeignKey("items.id"))
    shop_id: Mapped[UUID] = mapped_column(ForeignKey("shops.id"))
    price: Mapped[int]
    quantity: Mapped[int]
    purchase_price: Mapped[int]

    item = relationship("ItemORM", back_populates="shop_items")
    shop = relationship("ShopORM", back_populates="shop_items")
    cart = relationship("ItemCartORM", back_populates="shop_items")

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
    ) -> "ItemShopORM | None":
        await db.get(cls, (item_id, shop_id))


    @classmethod
    async def check_exists(
            cls,
            item_id: UUID,
            shop_id: UUID,
            db: AsyncSession
    ) -> bool:
        return cls.get_by_id(item_id, shop_id, db) is not None


class ItemQueueORM(Base):
    __tablename__ = "shop_queues"

    item_id: Mapped[UUID] = mapped_column(ForeignKey("items.id"))
    shop_id: Mapped[UUID] = mapped_column(ForeignKey("shops.id"))
    price: Mapped[int]
    quantity: Mapped[int]
    purchase_price: Mapped[int]
    created_at: Mapped[datetime.datetime] = mapped_column(
        server_default=func.now()
    )

    item = relationship("ItemORM", back_populates="shop_queues")

    __table_args__ = (
        PrimaryKeyConstraint(item_id, shop_id, created_at),
    )

    @classmethod
    async def get_all(
            cls,
            item_id: UUID,
            shop_id: UUID,
            db: AsyncSession
    ) -> "list[ItemQueueORM]":

        result = await db.execute(
            select(cls)
            .where(
                (cls.item_id == item_id)
                & (cls.shop_id == shop_id)
            )
            .order_by(cls.item_id)
        )

        return list(result.scalars().all())


    @classmethod
    async def get_next(
            cls,
            item_id: UUID,
            shop_id: UUID,
            db: AsyncSession
    ) -> "ItemQueueORM | None":
        result = await db.execute(
            select(cls)
            .where(
                (cls.item_id == item_id)
                & (cls.shop_id == shop_id)
            )
            .order_by(cls.created_at.asc())
            .limit(1)
        )

        return result.scalar_one_or_none()


class ItemCartORM(Base):
    __tablename__ = "shop_cart"

    shop_id: Mapped[UUID] = mapped_column()
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    item_id: Mapped[UUID] = mapped_column()
    quantity: Mapped[int] = mapped_column(server_default="1")

    shop_items = relationship("ItemShopORM", back_populates="cart")

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
    ) -> "ItemCartORM | None":
        return await db.get(cls, (shop_id, user_id, item_id))


class ItemSoldORM(Base):
    __tablename__ = "items_sold"

    item_id: Mapped[UUID] = mapped_column(ForeignKey("items.id"))
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    shop_id: Mapped[UUID] = mapped_column(ForeignKey("shops.id"))
    price: Mapped[int]
    quantity: Mapped[int] = mapped_column(server_default="1")
    income: Mapped[int] = mapped_column(BigInteger)
    created_at: Mapped[datetime.datetime] = mapped_column(
        server_default=func.now()
    )

    item = relationship("ItemORM", back_populates="items_sold")

    __table_args__ = (
        PrimaryKeyConstraint(item_id, user_id, shop_id, created_at),
        CheckConstraint("price > 0", name="check_price_positive"),
        CheckConstraint("quantity > 0", name="check_quantity_positive")
    )
