import uuid
import datetime

from sqlalchemy import String, BigInteger, ForeignKey, CheckConstraint, \
    PrimaryKeyConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from databases.sqlalchemy import Base


class ItemORM(Base):
    __tablename__ = "items"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=func.gen_random_uuid()
    )
    name: Mapped[str] = mapped_column(String(50))

    items_sold = relationship("ItemSoldORM", back_populates="item")
    shop_items = relationship("ShopItemsORM", back_populates="item")


class ItemSoldORM(Base):
    __tablename__ = "items_sold"

    item_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("items.id"))
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    shop_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("shops.id"))
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
