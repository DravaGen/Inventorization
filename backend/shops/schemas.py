from uuid import UUID
from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, model_validator


Name32 = Annotated[str, Field(max_length=32)]
Address64 = Annotated[str, Field(max_length=64)]


class ShopResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    address: str
    created_at: datetime


class ShopCreateForm(BaseModel):

    name: Name32
    address: Address64


class ShopUpdateForm(BaseModel):

    name: Name32 | None = None
    address: Address64 | None = None

    @model_validator(mode="after")
    def validate_empty(self):

        if not self.model_dump(exclude_none=True):
            raise ValueError("Empty data")

        return self


class UserAccessResponse(BaseModel):

    user_id: UUID
    shop_ids: list[UUID]


class ShopAccessResponse(BaseModel):

    shop_id: UUID
    user_ids: list[UUID]


class ShopAccessForm(BaseModel):

    user_id: UUID
    shop_id: UUID
