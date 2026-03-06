from uuid import UUID
from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field

from databases.sqlalchemy import PositiveIntField


class ItemInitForm(BaseModel):
    """Форма создания items"""

    name: str = Field(..., max_length=50)


class ItemInitResponse(BaseModel):
    """Схема ответа item_id после создания описание о товаре"""

    item_id: UUID


class ItemDeleteForm(BaseModel):
    """Форма удаления items"""

    item_id: UUID


class ItemSchema(BaseModel):
    """Схема items"""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str


class ItemInShopSchema(ItemSchema):
    """"""

    price: int
    quantity: int
    purchase_price: int
    created_at: datetime | None


class ItemResponse(ItemSchema):
    """Схема ответа информации о товаре и количестве"""

    quantity: int


class ItemInShopResponse(BaseModel):

    items: list[Optional[ItemInShopSchema]]
    queues: list[Optional[ItemInShopSchema]]


class ItemShopForm(BaseModel):
    """Форма добавления товара в магазин"""

    item_id: UUID
    price: PositiveIntField = Field(examples=[120])
    quantity: PositiveIntField = Field(examples=[10])
    purchase_price: PositiveIntField = Field(examples=[100])



class ItemQueueForm(ItemShopForm):
    """Форма создания продукта"""

    pass


class ItemQueueDeleteForm(BaseModel):
    """Форма удаления items queue"""

    item_id: UUID
    created_at: datetime


class ItemSoldResoinse(BaseModel):
    """Схема ответа сгруппированные данные о статистике продаж"""

    model_config = ConfigDict(from_attributes=True)

    date: date
    count: int
    income: int


class ItemInCartSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    item_id: UUID = Field(..., serialization_alias="id")
    quantity: int


class AddItemInCartResponse(BaseModel):
    item: ItemInCartSchema


class DeleteItemInCartResponse(BaseModel):
    item: ItemInCartSchema | None


class UpdateCartItemQuantityForm(BaseModel):
    item_id: UUID
    quantity: int


class UpdateItemInCartResponse(BaseModel):
    item: ItemInCartSchema | None


class ShopCartItemResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    item_id: UUID = Field(serialization_alias="id")
    name: str
    quantity: int


class ShopCartItemForm(BaseModel):

    item_id: UUID
    quantity: int = Field(1, ge=1)
