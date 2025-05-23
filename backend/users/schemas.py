from enum import Enum
from typing import Annotated
from pydantic import BaseModel, Field, model_validator


email_pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
EMAIL = Annotated[str, Field(pattern=email_pattern, examples=["mail@example.com"])]
PASSWORD = Annotated[str, Field(min_length=8, max_length=32, examples=["password"])]


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


class UserSignupForm(BaseModel):
    """Форма создания пользователя"""

    email: EMAIL
    password: PASSWORD
    status: UserStatus = UserStatus.WORKER


class UserUpdateForm(BaseModel):
    """Форма обновления пользователя"""

    password: PASSWORD | None = None
    status: UserStatus | None = None

    @model_validator(mode="after")
    def validate_empty(self):
        """Проверяет что данные не пустые"""

        if not any(self.model_dump().values()):
            raise ValueError("Empty data")

        return self
