from uuid import UUID
from typing import Optional
from fastapi import APIRouter, status

from .schemas import ShopResponse, ShopCreateForm, ShopUpdateForm, \
    UserAccessResponse, ShopAccessResponse, ShopItemForm, ShopItemResponse, \
    ShopQueueDeleteForm, ShopCartItemForm, CartItemSchema, ShopCartItemResponse, \
    UpdateCartQuantityForm
from .services import ShopService

from auth.services import CurrentUser, CurrentShop, \
    UserStatusISOwner, UserStatusISWorker, UserStatusISAdmin
from databases.sqlalchemy import SessionDep
from responses import ResponseDescription, ResponseDescriptions


shops_router = APIRouter()
shops_access_router = APIRouter()
shop_items_roter = APIRouter()
shop_cart_route = APIRouter()


@shops_router.post(
    "/",
    dependencies=[UserStatusISOwner]
)
async def create_shop(
    user: CurrentUser,
    form: ShopCreateForm,
    db: SessionDep
) -> ShopResponse:
    """Создает магазин"""

    shop = ShopService.create_shop(user, form, db)
    return ShopResponse.model_validate(shop)


@shops_router.patch(
    "/",
    dependencies=[UserStatusISOwner]
)
async def update_shop(
    shop: CurrentShop,
    form: ShopUpdateForm,
    db: SessionDep
) -> None:
    """Обновляет магазин"""

    await ShopService.update_shop(shop, form, db)


@shops_router.get(
    "/list",
    dependencies=[UserStatusISWorker]
)
async def get_shops(
    user: CurrentUser,
    db: SessionDep
) -> list[Optional[ShopResponse]]:
    """Возвращает все магазины в зависимости от доступа"""

    shops = await ShopService.get_shops(user, db)
    return [ShopResponse.model_validate(shop) for shop in shops]


@shops_access_router.get(
    "/",
    dependencies=[UserStatusISAdmin]
)
async def get_access(
    shop: CurrentShop,
    db: SessionDep
) -> ShopAccessResponse:
    """Возвращает пользователей которые имеют доступ в магазин"""

    return await ShopService.get_access(shop, db)


@shops_access_router.get(
    "/self",
    dependencies=[UserStatusISWorker]
)
async def get_self_access(
    user: CurrentUser,
    db: SessionDep
)-> UserAccessResponse:
    """Возвращает пользователей которые прикреплены к магазину"""

    return await ShopService.get_self_access(user, db)


@shops_access_router.post(
    "/",
    dependencies=[UserStatusISOwner]
)
async def grant_access(
    shop: CurrentShop,
    user_id: UUID,
    db: SessionDep
)-> None:
    """Выдает доступ к магазину"""

    await ShopService.grant_access(shop, user_id, db)


@shops_access_router.delete(
    "/",
    dependencies=[UserStatusISOwner]
)
async def revoke_access(
    shop: CurrentShop,
    user_id: UUID,
    db: SessionDep
)-> None:
    """Удаляет доступ к магазину"""

    await ShopService.revoke_access(shop, user_id, db)


@shop_items_roter.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    dependencies=[UserStatusISAdmin],
    responses=ResponseDescriptions((
        ResponseDescription(
            status_code=status.HTTP_404_NOT_FOUND,
            description="item not found"
        ),
    ))
)
async def add_shop_item(
    shop: CurrentShop,
    form: ShopItemForm,
    db: SessionDep
) -> None:
    """Добавляет товар в магазин или в очередь товаров в магазине"""

    await ShopService.add_item(shop, form, db)


@shop_items_roter.get(
    "/",
    dependencies=[UserStatusISWorker]
)
async def get_shop_items(
    shop: CurrentShop,
    db: SessionDep
) -> ShopItemResponse:
    """Возвращает все товары которые есть в магазине"""

    return await ShopService.get_all_items(shop, db )


@shop_items_roter.delete(
    "/",
    dependencies=[UserStatusISAdmin]
)
async def delete_shop_item(
    shop: CurrentShop,
    item_id: UUID,
    db: SessionDep
) -> None:
    """Удаляет товар из магазина если у нее нет связи"""

    await ShopService.delete_item(shop, item_id, db)


@shop_items_roter.delete(
    "/queue",
    dependencies=[UserStatusISAdmin]
)
async def delete_shop_queue(
    shop: CurrentShop,
    form: ShopQueueDeleteForm,
    db: SessionDep
) -> None:
    """удаляет товар из очереди в магазине"""

    await ShopService.delete_item_queue(shop, form, db)



@shop_cart_route.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    dependencies=[UserStatusISWorker],
    responses=ResponseDescriptions((
        ResponseDescription(
            status_code=status.HTTP_409_CONFLICT,
            description="Exceed available quantity"
        ),
    ))
)
async def add_cart_item(
    user: CurrentUser,
    shop: CurrentShop,
    form: ShopCartItemForm,
    db: SessionDep
) -> CartItemSchema:
    """Добавляет товар в корзину"""

    return await ShopService.add_cart_item(user, shop, form, db)


@shop_cart_route.get(
    "/",
    dependencies=[UserStatusISWorker]
)
async def get_cart_items(
    user: CurrentUser,
    shop: CurrentShop,
    db: SessionDep
) -> list[ShopCartItemResponse]:
    """Возвращает товары из корзины"""

    return await ShopService.get_cart_items(user, shop, db)


@shop_cart_route.delete(
    "/",
    dependencies=[UserStatusISWorker],
    responses=ResponseDescriptions((
        ResponseDescription(
            status_code=status.HTTP_404_NOT_FOUND,
            description="You can't delete an item from the cart " \
                "because it's not there."
        ),
    ))
)
async def del_cart_item(
    user: CurrentUser,
    shop: CurrentShop,
    form: ShopCartItemForm,
    db: SessionDep
) -> CartItemSchema | None:
    """Удаляет товар из корзины"""

    return await ShopService.del_cart_item(user, shop, form, db)


@shop_cart_route.delete(
    "/all",
    dependencies=[UserStatusISWorker]
)
async def clear_cart(
    user: CurrentUser,
    shop: CurrentShop,
    db: SessionDep
) -> None:
    """Удаляет все товары из корзины"""

    await ShopService.clear_cart(user, shop, db)


@shop_cart_route.patch(
    "/quantity",
    status_code=status.HTTP_200_OK,
    dependencies=[UserStatusISWorker],
    responses=ResponseDescriptions((
        ResponseDescription(
            status_code=status.HTTP_409_CONFLICT,
            description="Exceed available quantity"
        ),
    ))
)
async def update_cart_item_quantity(
    user: CurrentUser,
    shop: CurrentShop,
    form: UpdateCartQuantityForm,
    db: SessionDep
) -> CartItemSchema | None:
    """Добавляет товар в корзину"""

    return await ShopService.update_cart_item_quantity(user, shop, form, db)


@shop_cart_route.post(
    "/confirm",
    dependencies=[UserStatusISWorker],
    responses=ResponseDescriptions((
        ResponseDescription(
            status_code=status.HTTP_404_NOT_FOUND,
            description="The shopping cart is empty."
        ),
        ResponseDescription(
            status_code=status.HTTP_409_CONFLICT,
            description="There is not enough product in the store."
        )
    ))
)
async def confirm_cart(
    user: CurrentUser,
    shop: CurrentShop,
    db: SessionDep
) -> None:
    """Подтверждает покупку"""

    await ShopService.confirm_cart(user, shop, db)
