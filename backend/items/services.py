from uuid import UUID
from fastapi import HTTPException, status

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from .models import ItemORM, ItemSoldORM
from .schemas import ItemInitForm, ItemInitResponse, ItemResponse, \
    ItemSoldResponse, ItemSchema, ItemDeleteForm


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
                quantity=sum(shop.quantity for shop in item.shop_items),
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
    async def get_solds(
        offset: int,
        limit: int,
        db: AsyncSession
    ) -> list[ItemSoldResponse]:

        return [
            ItemSoldResponse.model_validate(x)
            for x in await ItemSoldORM.get(offset, limit, db)
        ]

    @staticmethod
    async def get(item_id: UUID, db: AsyncSession) -> ItemORM:
        item = await ItemORM.get_by_id(item_id, db)

        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="item not found"
            )

        return item
