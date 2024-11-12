import uuid
import datetime

from sqlalchemy import String, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .schemas import UserStatus
from databases.sqlalchemy import Base, get_enum_values


class UserORM(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=func.gen_random_uuid()
    )
    email: Mapped[str] = mapped_column(String(100), unique=True)
    password: Mapped[str] = mapped_column(String(60))
    status: Mapped[UserStatus] = mapped_column(
        Enum(UserStatus, values_callable=get_enum_values)
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        server_default=func.now()
    )

    shops = relationship("ShopORM", "shops_users", back_populates="users")
