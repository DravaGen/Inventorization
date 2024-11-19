from uuid import UUID
from datetime import date
from pydantic import BaseModel, ConfigDict, Field


class ItemInitForm(BaseModel):
    """Форма создания items"""

    name: str = Field(..., max_length=50)


class ItemInitResponse(BaseModel):
    """Схема ответа item_id после создания описание о товаре"""

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
    price: int
    quantity: int
    price_purchase: int


class ItemSoldResoinse(BaseModel):
    """Схема ответа сгруппированные данные о статистике продаж"""

    model_config = ConfigDict(from_attributes=True)

    date: date
    count: int
    income: int
