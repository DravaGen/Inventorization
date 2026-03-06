from uuid import UUID
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, PositiveInt


class ItemInitForm(BaseModel):

    name: str = Field(..., max_length=50)


class ItemInitResponse(BaseModel):

    item_id: UUID


class ItemSchema(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str


class ItemResponse(ItemSchema):

    quantity: int


class ItemShopSchema(ItemSchema):

    price: int
    quantity: int
    purchase_price: int


class ItemQueueSchema(ItemShopSchema):

    created_at: datetime


class ItemShopResponse(BaseModel):

    items: list[ItemShopSchema]
    queues: list[ItemQueueSchema]


class ItemShopForm(BaseModel):

    item_id: UUID
    price: PositiveInt
    quantity: PositiveInt
    purchase_price: PositiveInt


class ItemQueueDeleteForm(BaseModel):

    item_id: UUID
    created_at: datetime


class ItemSoldResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    date: date
    count: int
    income: int


class CartItemSchema(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    item_id: UUID = Field(serialization_alias="id")
    quantity: int


class UpdateCartItemQuantityForm(BaseModel):

    item_id: UUID
    quantity: PositiveInt


class ShopCartItemResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    item_id: UUID = Field(serialization_alias="id")
    name: str
    quantity: int


class ShopCartItemForm(BaseModel):

    item_id: UUID
    quantity: PositiveInt = 1


class ItemDeleteForm(BaseModel):
    """Форма удаления items"""

    item_id: UUID

