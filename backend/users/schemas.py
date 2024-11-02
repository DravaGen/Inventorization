from enum import Enum
from pydantic import BaseModel, Field, model_validator


email_pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"


class UserStatus(Enum):
    """Статусы пользователей"""

    WORKER = "worker"
    ADMIN = "admin"
    OWNER = "owner"


class UserCreateForm(BaseModel):
    """Форма создания пользователя """

    email: str = Field(..., pattern=email_pattern)
    password: str = Field(..., min_length=8, max_length=32)


class UserUpdateForm(BaseModel):
    """Форма обновления пользователя """

    email: str | None = Field(None, pattern=email_pattern)
    password: str | None = Field(None, min_length=8, max_length=32)
    status: UserStatus | None = None

    @model_validator(mode="after")
    def validate_empty(self):
        """Проверяет что данные не пустые"""

        if not any(self.model_dump().values()):
            raise ValueError("Empty data")

        return self
