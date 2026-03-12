from datetime import date
from fastapi import APIRouter, status, Query

from .schemas import ItemInitForm, ItemInitResponse, ItemResponse, \
    ItemDeleteForm, ItemSoldDayResponse, ItemSoldItemResponse
from .services import ItemService

from responses import ResponseDescriptions, ResponseDescription
from auth.services import CurrentShop, UserStatusISOwner, UserStatusISAdmin
from databases.sqlalchemy import SessionDep


items_router = APIRouter()


@items_router.post(
    "/",
    dependencies=[UserStatusISOwner]
)
async def create_item(
    form: ItemInitForm,
    db: SessionDep
) -> ItemInitResponse:
    """Создает карточку товара"""

    return await ItemService.create_item(form, db)


@items_router.get(
    "/",
    dependencies=[UserStatusISAdmin]
)
async def get_items(
    db: SessionDep
) -> list[ItemResponse]:
    """Возвращает все карточки товаров"""

    return await ItemService.get_items(db)


@items_router.delete(
    "/",
    dependencies=[UserStatusISOwner],
    responses=ResponseDescriptions((
        ResponseDescription(
            status_code=status.HTTP_409_CONFLICT,
            description="It is not possible to delete an item " \
                "because it is associated with other data."
        ),
    ))
)
async def delete_item(
    form: ItemDeleteForm,
    db: SessionDep
) -> None:
    """Удаляет товар если у нее нет связи"""

    await ItemService.delete_item(form, db)


@items_router.get(
    "/stats",
    dependencies=[UserStatusISOwner]
)
async def get_day_stats(
    shop: CurrentShop,
    date: date,
    db: SessionDep,
) -> ItemSoldDayResponse:

    return await ItemService.get_day_stats(shop.id, date, db)

@items_router.get(
    "/stats/day",
    dependencies=[UserStatusISOwner]
)
async def get_day_stats_details(
    shop: CurrentShop,
    date: date,
    db: SessionDep,
) -> list[ItemSoldItemResponse]:

    return await ItemService.get_day_details(shop.id, date, db)
