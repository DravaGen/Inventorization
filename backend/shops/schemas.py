from uuid import UUID
from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, PositiveInt, NonNegativeInt, \
    Field, model_validator
from items.schemas import ItemSchema


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


class ShopItemForm(BaseModel):

    item_id: UUID
    price: PositiveInt
    quantity: PositiveInt
    purchase_price: PositiveInt


class ShopItemSchema(ItemSchema):

    model_config = ConfigDict(from_attributes=True)

    price: int
    quantity: int
    purchase_price: int

    @model_validator(mode="before")
    @classmethod
    def before(cls, value):

        data = dict(value.__dict__)
        data["name"] = value.item.name
        return data


class ShopQueueSchema(ShopItemSchema):

    created_at: datetime


class ShopItemResponse(BaseModel):

    items: list[ShopItemSchema]
    queues: list[ShopQueueSchema]


class ShopQueueDeleteForm(BaseModel):

    item_id: UUID
    created_at: datetime


class ShopCartItemForm(BaseModel):

    item_id: UUID
    quantity: PositiveInt = 1


class CartItemSchema(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    item_id: UUID = Field(serialization_alias="id")
    quantity: int


class ShopCartItemResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    item_id: UUID = Field(serialization_alias="id")
    name: str
    quantity: int

    @model_validator(mode="before")
    @classmethod
    def before(cls, value):

        data = dict(value.__dict__)
        data["name"] = value.shop_items.item.name
        return data


class UpdateCartQuantityForm(BaseModel):

    item_id: UUID
    quantity: NonNegativeInt
