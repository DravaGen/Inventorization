from uuid import UUID
from enum import Enum
from pydantic import BaseModel, EmailStr, ConfigDict, model_validator
from datetime import datetime


class UserStatus(Enum):
    BANNED = "banned"
    WORKER = "worker"
    ADMIN = "admin"
    OWNER = "owner"


weights_user_status = {
    UserStatus.BANNED: 0,
    UserStatus.WORKER: 50,
    UserStatus.ADMIN: 80,
    UserStatus.OWNER: 100
}


class GetUserRequest(BaseModel):
    user_ids: list[UUID] | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    status: UserStatus
    created_at: datetime


class UserSignupForm(BaseModel):
    email: EmailStr
    status: UserStatus = UserStatus.WORKER


class UserUpdateForm(BaseModel):
    status: UserStatus | None = None

    @model_validator(mode="after")
    def validate_empty(self):
        if not any(self.model_dump().values()):
            raise ValueError("Empty data")
        return self
