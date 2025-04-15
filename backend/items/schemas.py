from uuid import UUID
from datetime import date
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


class ItemResponse(ItemSchema):
    """Схема ответа информации о товаре и количестве"""

    quantity: int


class ItemReceivingForm(BaseModel):
    """Форма создания продукта"""

    item_id: UUID
    price: PositiveIntField = Field(examples=[120])
    quantity: PositiveIntField = Field(examples=[10])
    purchase_price: PositiveIntField = Field(examples=[100])


class ItemSoldResoinse(BaseModel):
    """Схема ответа сгруппированные данные о статистике продаж"""

    model_config = ConfigDict(from_attributes=True)

    date: date
    count: int
    income: int
