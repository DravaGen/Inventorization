from pydantic import BaseModel, Field


class ShopCrateForm(BaseModel):
    """Форма создания магазина"""

    city: str = Field(..., max_length=32)
    address: str = Field(..., max_length=64)
