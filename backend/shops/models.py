import uuid
import datetime

from sqlalchemy import String, ForeignKey, CheckConstraint, \
    PrimaryKeyConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from databases.sqlalchemy import Base


class ShopORM(Base):
    __tablename__ = "shops"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=func.gen_random_uuid()
    )
    city: Mapped[str] = mapped_column(String(32))
    address: Mapped[str] = mapped_column(String(64))
    createad_at: Mapped[datetime.datetime] = mapped_column(
        nullable=False,
        server_default=func.now()
    )


class ShopUserORM(Base):
    __tablename__ = "shops_users"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), primary_key=True
    )
    shop_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("shops.id"), primary_key=True
    )


class ShopCartORM(Base):
    __tablename__ = "shops_carts"

    shop_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("shops.id"),
        nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )
    item_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("items.id"),
        nullable=False
    )
    quantity: Mapped[int] = mapped_column(
        nullable=False,
        server_default="1"
    )

    __table_args__ = (
        PrimaryKeyConstraint(shop_id, user_id, item_id),
        CheckConstraint("quantity > 0", name="check_quantity_positive")
    )
