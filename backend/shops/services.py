from uuid import UUID
from typing import Sequence
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from .models import ShopORM, ShopAccessORM, ShopItemORM, ShopQueueORM, ShopCartORM
from .schemas import ShopCreateForm, ShopUpdateForm, UserAccessResponse, \
    ShopAccessResponse, ShopItemForm, ShopItemSchema, ShopQueueSchema, \
    ShopItemResponse, ShopQueueDeleteForm, ShopCartItemForm, CartItemSchema, \
    ShopCartItemResponse, UpdateCartQuantityForm

from users.models import UserORM
from users.schemas import UserStatus
from items.models import ItemSoldORM
from items.services import ItemService


class ShopService:

    @staticmethod
    async def create_shop(
        user: UserORM,
        form: ShopCreateForm,
        db: AsyncSession
    ) -> ShopORM:

        shop = await ShopORM.create(form.model_dump(), db=db)
        await ShopAccessORM.grant_access(shop.id, user.id, db)
        return shop

    @staticmethod
    async def update_shop(
        shop: ShopORM,
        form: ShopUpdateForm,
        db: AsyncSession
    ) -> None:

        await shop.update(form.model_dump(exclude_unset=True))

    @staticmethod
    async def get_item_by_id(item_id: UUID, shop_id: UUID, db: AsyncSession) -> ShopItemORM:
        item = await ShopItemORM.get(item_id, shop_id, db)

        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="item not in shop "
            )

        return item

    @staticmethod
    async def get_shops(
        user: UserORM,
        db: AsyncSession
    ) -> Sequence[ShopORM]:

        if user.status == UserStatus.OWNER:
            shops = await ShopORM.get_all(db)
        else:
            shops = await ShopORM.get_user_shops(user.id, db)

        return shops

    @staticmethod
    async def get_access(
        shop: ShopORM,
        db: AsyncSession
    ) -> ShopAccessResponse:

        user_ids = await ShopAccessORM.get_user_ids(shop.id, db)
        return ShopAccessResponse(shop_id=shop.id, user_ids=list(user_ids))

    @staticmethod
    async def get_self_access(
        user: UserORM,
        db: AsyncSession
    )-> UserAccessResponse:

        user_id = user.id
        shop_ids = await ShopAccessORM.get_shop_ids(user_id, db)
        return UserAccessResponse(user_id=user_id, shop_ids=list(shop_ids))

    @staticmethod
    async def grant_access(
        shop: ShopORM,
        user_id: UUID,
        db: AsyncSession
    ) -> None:

        if await ShopAccessORM.check_access(shop.id, user_id, db):
            return

        await ShopAccessORM.grant_access(shop.id, user_id, db)

    @staticmethod
    async def revoke_access(
        shop: ShopORM,
        user_id: UUID,
        db: AsyncSession
    )-> None:

        await ShopAccessORM.revoke_access(shop.id, user_id, db)

    @staticmethod
    async def add_item(
        shop: ShopORM,
        form: ShopItemForm,
        db: AsyncSession
    ) -> None:
        item_id = form.item_id
        await ItemService.get(item_id, db)

        data = form.model_dump()
        if await ShopItemORM.check_exists(item_id, shop.id, db):
            await ShopQueueORM.add(shop.id, data, db)
        else:
            await ShopItemORM.add(shop.id, data, db)

    @staticmethod
    async def get_all_items(
        shop: ShopORM,
        db: AsyncSession
    ) -> ShopItemResponse:

        items = await ShopItemORM.get_all(shop.id, db)
        queues = await ShopQueueORM.get_all(shop.id, db)

        return ShopItemResponse(
            items=[ShopItemSchema.model_validate(i) for i in items],
            queues=[ShopQueueSchema.model_validate(q) for q in queues]
        )

    @staticmethod
    async def delete_item(
        shop: ShopORM,
        item_id: UUID,
        db: AsyncSession
    ) -> None:

        try:
            await ShopItemORM.delete(item_id, shop.id, db)
            next_item = await ShopQueueORM.get_next(item_id, shop.id, db)
            if next_item:
                await ShopItemORM.add(shop.id, next_item.__dict__, db)
                await db.delete(next_item)

        except IntegrityError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="It is not possible to delete an item " \
                    "because it is associated with other data."
            )

    @staticmethod
    async def delete_item_queue(
        shop: ShopORM,
        form: ShopQueueDeleteForm,
        db: AsyncSession
    ) -> None:

        await ShopQueueORM.delete(shop.id, form.item_id, form.created_at, db)


    @classmethod
    async def add_cart_item(
        cls,
        user: UserORM,
        shop: ShopORM,
        form: ShopCartItemForm,
        db: AsyncSession
    ) -> CartItemSchema:
        item_id = form.item_id

        item_shop = await cls.get_item_by_id(item_id, shop.id, db)
        item_cart = await ShopCartORM.get(item_id, user.id, shop.id, db)

        if (
            item_shop.quantity
            - (item_cart.quantity if item_cart else 0)
            - form.quantity
            < 0
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Exceed available quantity"
            )

        if item_cart:
            item_cart.quantity += form.quantity

        else:
            item_cart = await ShopCartORM.create(
                form.model_dump(), shop.id, user.id, db
            )

        return CartItemSchema(
            item_id=item_cart.item_id,
            quantity=item_cart.quantity
        )

    @staticmethod
    async def get_cart_items(
        user: UserORM,
        shop: ShopORM,
        db: AsyncSession
    ) -> list[ShopCartItemResponse]:
        """Возвращает товары из корзины"""

        items = await ShopCartORM.get_all(shop.id, user.id, db)
        return [ShopCartItemResponse.model_validate(i) for i in items]

    @staticmethod
    async def del_cart_item(
        user: UserORM,
        shop: ShopORM,
        form: ShopCartItemForm,
        db: AsyncSession
    ) -> CartItemSchema | None:
        """Удаляет товар из корзины"""

        item = await ShopCartORM.get(form.item_id, user.id, shop.id, db)

        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="You can't delete an item from the cart."
            )

        response = None

        if item.quantity - form.quantity > 0:
            item.quantity -= form.quantity
            response = CartItemSchema(
                item_id=item.item_id,
                quantity=item.quantity
            )
        else:
            await db.delete(item)

        return response

    @staticmethod
    async def clear_cart(
        user: UserORM,
        shop: ShopORM,
        db: AsyncSession
    ) -> None:
        """Удаляет все товары из корзины"""

        await ShopCartORM.delete_all(shop.id, user.id, db)

    @classmethod
    async def update_cart_item_quantity(
        cls,
        user: UserORM,
        shop: ShopORM,
        form: UpdateCartQuantityForm,
        db: AsyncSession
    ) -> CartItemSchema | None:
        """Добавляет товар в корзину"""

        item_id = form.item_id

        item_shop = await cls.get_item_by_id(item_id, shop.id, db)
        item_cart = await ShopCartORM.get(item_id, user.id, shop.id, db)

        if not item_cart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="item in cart not found"
            )

        if (
            item_shop.quantity
            - (item_cart.quantity if item_cart else 0)
            - form.quantity
            < 0
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Exceed available quantity"
            )

        response = None

        if form.quantity > 0:
            item_cart.quantity = form.quantity
            response = CartItemSchema(
                item_id=item_cart.item_id,
                quantity=item_cart.quantity
            )
        else:
            await db.delete(item_cart)

        return response

    @staticmethod
    async def confirm_cart(
        user: UserORM,
        shop: ShopORM,
        db: AsyncSession
    ) -> None:
        """Подтверждает покупку"""

        cart = await ShopCartORM.get_all(shop.id, user.id, db)

        if not cart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="The shopping cart is empty."
            )

        try:
            for cart_item in cart:
                item: ShopItemORM = cart_item.shop_items

                if item.quantity < cart_item.quantity:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="There is not enough product in the store."
                    )

                item.quantity -= cart_item.quantity

                sold_data = {
                    "item_id": cart_item.item_id,
                    "user_id": cart_item.user_id,
                    "shop_id": cart_item.shop_id,
                    "price": item.price,
                    "quantity": cart_item.quantity,
                    "income": (item.price - item.purchase_price) * cart_item.quantity
                }
                await ItemSoldORM.create(sold_data, db)

                if item.quantity == 0:
                    next_item = await ShopQueueORM.get_next(cart_item.item_id, shop.id, db)
                    if next_item:
                        await ShopItemORM.add(shop.id, next_item.__dict__, db)
                        await db.delete(next_item)

            await ShopCartORM.delete_all(shop.id, user.id, db)

        except Exception as ex:
            await db.rollback()
            raise ex
