from .models import ItemORM
from .schemas import ItemSchema, ItemResponse


def format_items_quantity(
        items: list[ItemORM]
) -> list[ItemResponse]:
    """
        Возвращает список информации о товаре и его общем количестве.
        Внутри происходит подсчет количества
    """

    response = []

    for item in items:
        shops_quantity = sum(
            shop.quantity
            for shop in item.items_in_shops
        )
        queue_quantity = sum(
            queue.quantity
            for shop in item.items_in_shops
            for queue in shop.queues
        )
        total_quantity = shops_quantity + queue_quantity

        response.append(
            ItemResponse(
                **ItemSchema.model_validate(item).model_dump(),
                quantity=total_quantity
            )
        )

    return response
