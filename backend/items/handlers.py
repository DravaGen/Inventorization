from typing import Optional
from fastapi import APIRouter, HTTPException, status, Query

from sqlalchemy import insert, select, update, delete, func
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import IntegrityError

from .models import ItemORM, ItemShopORM, ItemQueueORM, ItemCartORM, ItemSoldORM
from .schemas import ItemInitForm, ItemInitResponse, ItemDeleteForm, \
    ItemResponse, ItemInShopResponse, ItemSoldResoinse, ItemShopForm, \
    ItemQueueForm, ItemQueueDeleteForm, ItemInCartSchema, \
    AddItemInCartResponse, DeleteItemInCartResponse, \
    UpdateItemInCartResponse, UpdateCartItemQuantityForm, \
    ShopCartItemResponse, ShopCartItemForm, ItemSchema, \
    ItemInShopSchema

from responses import ResponseOK, ResponseDescriptions, ResponseDescription
from auth.services import CurrentShopID, CurrentUserID, UserStatusISOwner, \
    UserStatusISAdmin, UserStatusISWorker
from databases.sqlalchemy import SessionDep, convert_query_to_list_dicts


items_router = APIRouter()
item_shop_route = APIRouter(
    prefix="/shop",
    tags=["Items In Shop"]
)
item_cart_route = APIRouter(
    prefix="/cart",
    tags=["Items In Cart"]
)


@items_router.post(
    "/",
    dependencies=[UserStatusISOwner]
)
async def create_item(
        form_data: ItemInitForm,
        db: SessionDep
) -> ItemInitResponse:
    """Создает карточку товара"""

    result = await db.execute(
        insert(ItemORM)
        .values(**form_data.model_dump())
        .returning(ItemORM)
    )
    item = result.scalar_one()

    return ItemInitResponse(item_id=item.id)


@items_router.get(
    "/",
    dependencies=[UserStatusISAdmin]
)
async def get_items(
        db: SessionDep
) -> list[Optional[ItemResponse]]:
    """Возвращает все карточки товаров"""

    response = await db.execute(
        select(ItemORM)
        .options(joinedload(ItemORM.shop_items))
        .order_by(ItemORM.id)
    )
    items = list(response.unique().scalars().all())

    return [
        ItemResponse(
            **ItemSchema.model_validate(item).model_dump(),
            quantity=sum(shop.quantity for shop in item.shop_items)
        )
        for item in items
        if isinstance(item, ItemORM)
    ]



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
        form_data: ItemDeleteForm,
        db: SessionDep
) -> ResponseOK:
    """Удаляет товар если у нее нет связи"""

    try:
        await db.execute(
            delete(ItemORM)
            .where(ItemORM.id == form_data.item_id)
        )
        return ResponseOK(detail="item deleted")

    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="It is not possible to delete an item " \
                "because it is associated with other data."
        )


@items_router.get(
    "/sold",
    dependencies=[UserStatusISOwner]
)
async def get_solds(
        db: SessionDep,
        offset: int = Query(0, ge=0),
        limit: int = Query(7, ge=1, le=31)
) -> list[ItemSoldResoinse]:
    """Возвращает статистику о продаже"""

    sold_items = await db.execute(
        select(
            func.date(ItemSoldORM.created_at).label("date"),
            func.count().label("count"),
            func.sum(ItemSoldORM.income).label("income")
        )
        .group_by(func.date(ItemSoldORM.created_at))
        .offset(offset)
        .limit(limit)
    )
    return convert_query_to_list_dicts(ItemSoldResoinse, sold_items)


@item_shop_route.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    dependencies=[UserStatusISAdmin],
    responses=ResponseDescriptions((
        ResponseDescription(
            status_code=status.HTTP_201_CREATED,
            model=str,
            description="Item added to shop"
        ),
        ResponseDescription(
            status_code=status.HTTP_202_ACCEPTED,
            model=str,
            description="Item added to shop queue"
        )
    ))
)
async def add_shop_item(
        shop_id: CurrentShopID,
        form_data: ItemShopForm,
        db: SessionDep
) -> ResponseOK:
    """Добавляет товар в магазин или в очередь товаров в магазине"""

    item_id = form_data.item_id

    if not await ItemORM.check_exists(item_id, db):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="item not found"
        )

    item_exists = await ItemShopORM.check_exists(item_id, shop_id, db)
    await db.execute(
        insert(ItemQueueORM if item_exists else ItemShopORM)
        .values(**form_data.model_dump(), shop_id=shop_id)
    )

    return ResponseOK(
        status_code=status.HTTP_202_ACCEPTED
            if item_exists else status.HTTP_201_CREATED,
        detail=f"Item added to {'queue' if item_exists else 'shop'}"
    )


@item_shop_route.get(
    "/",
    dependencies=[UserStatusISWorker]
)
async def get_shop_items(
        shop_id: CurrentShopID,
        db: SessionDep
) -> ItemInShopResponse:
    """Возвращает все товары которые есть в магазине"""

    items = await db.execute(
        select(ItemShopORM)
        .options(joinedload(ItemShopORM.item))
        .where(ItemShopORM.shop_id == shop_id)
        .order_by(ItemShopORM.item_id)
    )

    queue = await db.execute(
        select(ItemQueueORM)
        .options(joinedload(ItemQueueORM.item))
        .where(ItemQueueORM.shop_id == shop_id)
        .order_by(ItemQueueORM.item_id)
    )

    return ItemInShopResponse(
        items=[
            ItemInShopSchema(
                id=item.item_id,
                name=item.item.name,
                price=item.price,
                quantity=item.quantity,
                purchase_price=item.purchase_price,
                created_at=None
            )
            for item in items.unique().scalars().all()
        ],
        queues=[
            ItemInShopSchema(
                id=item.item_id,
                name=item.item.name,
                price=item.price,
                quantity=item.quantity,
                purchase_price=item.purchase_price,
                created_at=item.created_at
            )
            for item in queue.unique().scalars().all()
        ]
    )


@item_shop_route.delete(
    "/",
    dependencies=[UserStatusISAdmin],
    responses=ResponseDescriptions((
        ResponseDescription(
            status_code=status.HTTP_409_CONFLICT,
            description="It is not possible to delete an item " \
                "because it is associated with other data."
        ),
    ))
)
async def delete_shop_item(
        shop_id: CurrentShopID,
        form_data: ItemDeleteForm,
        db: SessionDep
) -> ResponseOK:
    """Удаляет товар из магазина если у нее нет связи"""

    try:
        await db.execute(
            delete(ItemShopORM)
            .where(
                (ItemShopORM.item_id == form_data.item_id)
                & (ItemShopORM.shop_id == shop_id)
            )
        )
        next_queue = await ItemQueueORM.get_next(form_data.item_id, shop_id, db)
        if (next_queue):
            await db.execute(
                insert(ItemShopORM)
                .values(
                    item_id=next_queue.item_id,
                    shop_id=next_queue.shop_id,
                    price=next_queue.price,
                    quantity=next_queue.quantity,
                    purchase_price=next_queue.purchase_price
                )
            )
            await db.delete(next_queue)

        return ResponseOK(detail="item deleted")

    except IntegrityError as er:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="It is not possible to delete an item " \
                "because it is associated with other data."
        )


@item_shop_route.delete(
    "/queue",
    dependencies=[UserStatusISAdmin]
)
async def delete_shop_queue(
        shop_id: CurrentShopID,
        form_data: ItemQueueDeleteForm,
        db: SessionDep
) -> ResponseOK:
    """удаляет товар из очереди в магазине"""

    await db.execute(
        delete(ItemQueueORM)
        .where(
            (ItemQueueORM.item_id == form_data.item_id)
            & (ItemQueueORM.created_at == form_data.created_at)
            & (ItemQueueORM.shop_id == shop_id)
        )
    )

    return ResponseOK(detail="item deleted")


@item_cart_route.post(
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
        user_id: CurrentUserID,
        shop_id: CurrentShopID,
        form_data: ShopCartItemForm,
        db: SessionDep
) -> AddItemInCartResponse:
    """Добавляет товар в корзину"""

    item_id = form_data.item_id

    item_cart = await ItemCartORM.get(item_id, user_id, shop_id, db)
    item_shop = await ItemShopORM.get(item_id, shop_id, db)

    if not item_shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="item in shop not found"
        )

    if (
        item_shop.quantity
        - (item_cart.quantity if item_cart else 0)
        - form_data.quantity
        < 0
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Exceed available quantity"
        )

    if item_cart:
        result = await db.execute(
            update(ItemCartORM)
            .where(
                (ItemCartORM.user_id == user_id)
                & (ItemCartORM.shop_id == shop_id)
                & (ItemCartORM.item_id == item_id)
            )
            .values(quantity=ItemCartORM.quantity + form_data.quantity)
            .returning(ItemCartORM)
        )

    else:
        result = await db.execute(
            insert(ItemCartORM)
            .values(
                shop_id=shop_id,
                user_id=user_id,
                **form_data.model_dump()
            )
            .returning(ItemCartORM)
        )

    item = result.scalar_one()

    return AddItemInCartResponse(
        item=ItemInCartSchema(
            item_id=item.item_id,
            quantity=item.quantity
        )
    )


@item_cart_route.get(
    "/",
    dependencies=[UserStatusISWorker]
)
async def get_cart_items(
        user_id: CurrentUserID,
        shop_id: CurrentShopID,
        db: SessionDep
) -> list[Optional[ShopCartItemResponse]]:
    """Возвращает товары из корзины"""

    cart = await db.execute(
        select(ItemCartORM)
        .options(
            joinedload(ItemCartORM.shop_items)
            .joinedload(ItemShopORM.item)  # загружаем item через shop_items
        )
        .where(
            (ItemCartORM.user_id == user_id)
            & (ItemCartORM.shop_id == shop_id)
        )
        .order_by(ItemCartORM.item_id)
    )
    cart = cart.scalars().unique().all()

    return [
        ShopCartItemResponse(
            item_id=x.item_id,
            name=x.shop_items.item.name,
            quantity=x.quantity
        ) for x in cart
    ]


@item_cart_route.delete(
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
        user_id: CurrentUserID,
        shop_id: CurrentShopID,
        form_data: ShopCartItemForm,
        db: SessionDep
) -> DeleteItemInCartResponse:
    """Удаляет товар из корзины"""

    item = await ItemCartORM.get(form_data.item_id, user_id, shop_id, db)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You can't delete an item from the cart."
        )

    if item.quantity - form_data.quantity > 0:
        item.quantity -= form_data.quantity
    else:
        await db.delete(item)
        item = None

    return DeleteItemInCartResponse(
        item=ItemInCartSchema(
            item_id=item.item_id,
            quantity=item.quantity
        ) if item else None
    )


@item_cart_route.delete(
    "/all",
    dependencies=[UserStatusISWorker]
)
async def clear_cart(
        user_id: CurrentUserID,
        shop_id: CurrentShopID,
        db: SessionDep
) -> ResponseOK:
    """Удаляет все товары из корзины"""

    await db.execute(
        delete(ItemCartORM)
        .where(
            (ItemCartORM.shop_id == shop_id)
            & (ItemCartORM.user_id == user_id)
        )
    )
    return ResponseOK(detail="cleaned cart")


@item_cart_route.patch(
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
        user_id: CurrentUserID,
        shop_id: CurrentShopID,
        form_data: UpdateCartItemQuantityForm,
        db: SessionDep
) -> UpdateItemInCartResponse:
    """Добавляет товар в корзину"""

    item_id = form_data.item_id

    item_cart = await ItemCartORM.get(item_id, user_id, shop_id, db)
    item_shop = await ItemShopORM.get(item_id, shop_id, db)

    if not item_shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="item in shop not found"
        )

    if not item_cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="item in cart not found"
        )

    if (
        item_shop.quantity
        - (item_cart.quantity if item_cart else 0)
        - form_data.quantity
        < 0
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Exceed available quantity"
        )

    if form_data.quantity > 0:
        item_cart.quantity = form_data.quantity
    else:
        await db.delete(item_cart)
        item_cart = None

    return UpdateItemInCartResponse(
        item=ItemInCartSchema(
            item_id=item_cart.item_id,
            quantity=item_cart.quantity
        ) if item_cart else None
    )


@item_cart_route.post(
    "/confirmm",
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
        user_id: CurrentUserID,
        shop_id: CurrentShopID,
        db: SessionDep
) -> ResponseOK:
    """Подтверждает покупку"""

    cart = await db.execute(
        select(ItemCartORM)
        .options(
            joinedload(ItemCartORM.shop_items)
        )
        .where(
            (ItemCartORM.user_id == user_id)
            & (ItemCartORM.shop_id == shop_id)
        )
    )
    cart = cart.scalars().all()

    if bool(cart) is False:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The shopping cart is empty."
        )

    try:
        for cart_item in cart:
            item: ItemShopORM = cart_item.shop_items

            try:
                item.quantity -= cart_item.quantity
            except:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="There is not enough product in the store."
                )

            await db.execute(
                insert(ItemSoldORM)
                .values(
                    item_id = cart_item.item_id,
                    user_id = cart_item.user_id,
                    shop_id = cart_item.shop_id,
                    price = item.price,
                    quantity = cart_item.quantity,
                    income = (item.price - item.purchase_price) * cart_item.quantity
                )
            )

            if item.quantity == 0:

                queue = await db.execute(
                    select(ItemQueueORM)
                    .where(
                        (ItemQueueORM.shop_id == shop_id)
                        & (ItemQueueORM.item_id == cart_item.item_id)
                    )
                    .order_by(ItemQueueORM.created_at.asc())
                )
                queue = queue.scalars().all()
                queue = queue[0] if queue else None

                if not queue:
                    continue

                await db.execute(
                    update(ItemShopORM)
                    .values(
                        price=queue.price,
                        quantity=queue.quantity,
                        purchase_price=queue.purchase_price
                    )
                    .where(ItemShopORM.item_id == cart_item.item_id)
                )
                await db.delete(queue)

        await db.execute(
            delete(ItemCartORM)
            .where(
                (ItemCartORM.shop_id == shop_id)
                & (ItemCartORM.user_id == user_id)
            )
        )

    except Exception as ex:
        await db.rollback()
        raise ex

    return ResponseOK(detail="purchase been confirmed")


items_router.include_router(item_shop_route)
items_router.include_router(item_cart_route)
