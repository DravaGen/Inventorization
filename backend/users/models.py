import uuid
import datetime

from sqlalchemy import String, Enum, func
from sqlalchemy.orm import Mapped, mapped_column

from .schemas import UserStatus
from databases.sqlalchemy import Base, get_enum_values


class UserORM(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=func.gen_random_uuid()
    )
    email: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True
    )
    password: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[UserStatus] = mapped_column(
        Enum(UserStatus, values_callable=get_enum_values),
        nullable=False
    )
    createad_at: Mapped[datetime.datetime] = mapped_column(
        nullable=False,
        server_default=func.now()
    )
