from uuid import UUID
from datetime import date
from fastapi import HTTPException, status

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from .models import ItemORM, ItemSoldORM
from .schemas import ItemInitForm, ItemInitResponse, ItemResponse, ItemSchema, \
    ItemDeleteForm, ItemSoldDayResponse, ItemSoldItemResponse


class ItemService:

    @staticmethod
    async def create_item(
        form: ItemInitForm,
        db: AsyncSession
    ) -> ItemInitResponse:

        item = await ItemORM.create(form.model_dump(), db)
        return ItemInitResponse(item_id=item.id)

    @staticmethod
    async def get_items(db: AsyncSession) -> list[ItemResponse]:

        items = await ItemORM.get_all(db)
        return [
            ItemResponse(
                **ItemSchema.model_validate(item).model_dump(),
                quantity=(
                    sum(shop.quantity for shop in item.shop_items)
                    + sum(queue.quantity for queue in item.shop_queues)
                ),
            )
            for item in items
        ]

    @staticmethod
    async def delete_item(
        form: ItemDeleteForm,
        db: AsyncSession
    ) -> None:

        try:
            await ItemORM.delete(form.item_id, db)

        except IntegrityError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="It is not possible to delete an item " \
                    "because it is associated with other data."
            )

    @staticmethod
    async def get(item_id: UUID, db: AsyncSession) -> ItemORM:
        item = await ItemORM.get_by_id(item_id, db)

        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="item not found"
            )

        return item

    @staticmethod
    async def get_day_stats(
        shop_id: UUID,
        date: date,
        db: AsyncSession
    ) -> ItemSoldDayResponse:

        day = await ItemSoldORM.get_day(shop_id, date, db)

        if not day:
            return ItemSoldDayResponse(
                date=date, count=0, total_profit=0, total_sales=0
            )

        return ItemSoldDayResponse.model_validate(day)

    @staticmethod
    async def get_day_details(
        shop_id: UUID,
        date: date,
        db: AsyncSession
    ) -> list[ItemSoldItemResponse]:

        items = await ItemSoldORM.get_day_items(shop_id, date, db)
        return [ItemSoldItemResponse.model_validate(i) for i in items]
