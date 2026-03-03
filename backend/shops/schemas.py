from uuid import UUID
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, model_validator


class ShopResponse(BaseModel):
    """Схема магазина"""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    address: str
    created_at: datetime


class ShopCrateForm(BaseModel):
    """Форма создания магазина"""

    name: str = Field(..., max_length=32)
    address: str = Field(..., max_length=64)


class ShopUpdateForm(BaseModel):
    """Форма создания магазина"""

    name: str | None = Field(None, max_length=32)
    address: str | None = Field(None, max_length=64)

    @model_validator(mode="after")
    def validate_empty(self):
        """Проверяет что данные не пустые"""

        if not any(self.model_dump().values()):
            raise ValueError("Empty data")

        return self


class ShopCrateResponse(ShopResponse):
    pass


class UserAccessResponse(BaseModel):
    """Схема доступа к магазинам"""

    user_id: UUID
    shop_ids: list[Optional[UUID]]


class ShopAccessResponse(BaseModel):
    """Схема доступа к магазинам"""

    shop_id: UUID
    user_ids: list[Optional[UUID]]


class ShopAccessForm(BaseModel):
    """Форма доступа в магазин"""

    user_id: UUID
    shop_id: UUID


class ShopCartItemForm(BaseModel):
    """Форма для управления товарами в корзине (добавление/удаление)"""

    item_id: UUID
    quantity: int = Field(1, ge=1)


class ShopCartItemResponse(BaseModel):
    """Товары в корзине"""

    item_id: UUID = Field(serialization_alias="id")
    name: str
    quantity: int

