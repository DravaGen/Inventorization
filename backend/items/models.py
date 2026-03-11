import datetime
from uuid import UUID
from typing import Sequence

from sqlalchemy import String, BigInteger, ForeignKey, CheckConstraint, \
    PrimaryKeyConstraint, func, select, delete
from sqlalchemy.orm import Mapped, mapped_column, relationship, joinedload
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
    shop_items = relationship("ShopItemORM", back_populates="item")
    shop_queues = relationship("ShopQueueORM", back_populates="item")


    @classmethod
    async def create(cls, data: dict, db: AsyncSession) -> "ItemORM":
        item = cls(**data)
        db.add(item)
        return item

    @classmethod
    async def get_by_id(cls, item_id: UUID, db: AsyncSession) -> "ItemORM | None":
        return await db.get(cls, item_id)

    @classmethod
    async def get_all(cls, db: AsyncSession) -> Sequence["ItemORM"]:
        result = await db.execute(
            select(cls)
            .options(joinedload(cls.shop_items))
            .order_by(cls.id)
        )
        return result.unique().scalars().all()

    @classmethod
    async def delete(cls, item_id: UUID, db: AsyncSession) -> None:
        await db.execute(delete(cls).where(cls.id == item_id))


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

    @classmethod
    async def get(
        cls,
        offset: int,
        limit: int,
        db: AsyncSession
    ) -> Sequence["ItemSoldORM"]:

        result = await db.execute(
            select(
                func.date(ItemSoldORM.created_at).label("date"),
                func.count().label("count"),
                func.sum(ItemSoldORM.income).label("income")
            )
            .group_by(func.date(ItemSoldORM.created_at))
            .offset(offset)
            .limit(limit)
        )

        return result.scalar().all()

    @classmethod
    async def create(
        cls,
        data: dict,
        db: AsyncSession
    ) -> "ItemSoldORM":
        sold = cls(**data)
        db.add(sold)
        await db.flush()
        return sold
