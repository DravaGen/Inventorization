from fastapi import APIRouter, status, Query

from .schemas import ItemInitForm, ItemInitResponse, ItemResponse, \
    ItemSoldResponse, ItemDeleteForm
from .services import ItemService

from responses import ResponseDescriptions, ResponseDescription
from auth.services import UserStatusISOwner, UserStatusISAdmin
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
    "/sold",
    dependencies=[UserStatusISOwner]
)
async def get_solds(
    db: SessionDep,
    offset: int = Query(0, ge=0),
    limit: int = Query(7, ge=1, le=31)
) -> list[ItemSoldResponse]:
    """Возвращает статистику о продаже"""

    return await ItemService.get_solds(offset, limit, db)
