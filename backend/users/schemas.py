from uuid import UUID
from enum import Enum
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field, model_validator
from datetime import datetime


email_pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
EMAIL = Annotated[str, Field(pattern=email_pattern, examples=["mail@example.com"])]


class UserStatus(Enum):
    """Статусы пользователей"""

    WORKER = "worker"
    ADMIN = "admin"
    OWNER = "owner"


weights_user_status = {
    UserStatus.WORKER: 50,
    UserStatus.ADMIN: 80,
    UserStatus.OWNER: 100
}  # Веса прав пользователей


class GetUserRequest(BaseModel):
    """"""
    user_ids: list[UUID | None] = []


class UserResponse(BaseModel):
    """"""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    status: UserStatus
    created_at: datetime


class UserSignupForm(BaseModel):
    """Форма создания пользователя"""

    email: EMAIL
    status: UserStatus = UserStatus.WORKER


class UserUpdateForm(BaseModel):
    """Форма обновления пользователя"""

    status: UserStatus | None = None

    @model_validator(mode="after")
    def validate_empty(self):
        """Проверяет что данные не пустые"""

        if not any(self.model_dump().values()):
            raise ValueError("Empty data")

        return self
