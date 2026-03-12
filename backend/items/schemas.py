from uuid import UUID
from datetime import date
from pydantic import BaseModel, ConfigDict, Field


class ItemInitForm(BaseModel):

    name: str = Field(..., max_length=50)


class ItemInitResponse(BaseModel):

    item_id: UUID


class ItemSchema(BaseModel):

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID = Field(alias="item_id", serialization_alias="id")
    name: str


class ItemResponse(ItemSchema):

    quantity: int


class ItemSoldResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    date: date
    count: int
    profit: int


class ItemDeleteForm(BaseModel):
    """Форма удаления items"""

    item_id: UUID


class ItemSoldDayResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    date: date
    count: int
    total_profit: int
    total_sales: int


class ItemSoldItemResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    item_id: UUID
    name: str
    sold: int
    profit: int
