import uuid
import datetime

from sqlalchemy import String, ForeignKey, CheckConstraint, \
    PrimaryKeyConstraint, ForeignKeyConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from databases.sqlalchemy import Base


class ShopORM(Base):
    __tablename__ = "shops"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=func.gen_random_uuid()
    )
    city: Mapped[str] = mapped_column(String(32))
    address: Mapped[str] = mapped_column(String(64))
    created_at: Mapped[datetime.datetime] = mapped_column(
        server_default=func.now()
    )

    users = relationship("UserORM", "shop_access", back_populates="shops")
    shop_items = relationship("ShopItemsORM", back_populates="shop")


class ShopAccessORM(Base):
    __tablename__ = "shop_access"

    shop_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("shops.id"), primary_key=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), primary_key=True
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        server_default=func.now()
    )


class ShopCartORM(Base):
    __tablename__ = "shop_cart"

    shop_id: Mapped[uuid.UUID] = mapped_column()
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    item_id: Mapped[uuid.UUID] = mapped_column()
    quantity: Mapped[int] = mapped_column(server_default="1")

    shop_items = relationship("ShopItemsORM", back_populates="cart")

    __table_args__ = (
        PrimaryKeyConstraint(shop_id, user_id, item_id),
        CheckConstraint("quantity > 0", name="check_quantity_positive"),
        ForeignKeyConstraint(
            ["item_id", "shop_id"],
            ["shop_items.item_id", "shop_items.shop_id"]
        )
    )


class ShopItemsORM(Base):
    __tablename__ = "shop_items"

    item_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("items.id"))
    shop_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("shops.id"))
    price: Mapped[int]
    quantity: Mapped[int]
    purchase_price: Mapped[int]

    item = relationship("ItemORM", back_populates="shop_items")
    shop = relationship("ShopORM", back_populates="shop_items")
    cart = relationship("ShopCartORM", back_populates="shop_items")
    queues = relationship("ShopQueueORM", back_populates="shop_items")

    __table_args__ = (
        PrimaryKeyConstraint(item_id, shop_id),
        CheckConstraint("price > 0", name="check_price_positive"),
        CheckConstraint("quantity >= 0", name="check_quantity")
    )


class ShopQueueORM(Base):
    __tablename__ = "shop_queues"

    item_id: Mapped[uuid.UUID] = mapped_column()
    shop_id: Mapped[uuid.UUID] = mapped_column()
    price: Mapped[int]
    quantity: Mapped[int]
    purchase_price: Mapped[int]
    created_at: Mapped[datetime.datetime] = mapped_column(
        server_default=func.now()
    )

    shop_items = relationship("ShopItemsORM", back_populates="queues")

    __table_args__ = (
        PrimaryKeyConstraint(item_id, shop_id, created_at),
        ForeignKeyConstraint(
            ["item_id", "shop_id"],
            ["shop_items.item_id", "shop_items.shop_id"]
        )
    )
