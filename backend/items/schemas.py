from pydantic import BaseModel, Field


class ItemCreateForm(BaseModel):
    """Схема создания продукта"""

    name: str = Field(..., max_length=50)
    price: int
    quantity: int
    price_purchase: int
