from uuid import UUID
from typing import Sequence

from .models import ShopORM
from .schemas import ShopCreateForm, ShopUpdateForm, \
    UserAccessResponse, ShopAccessResponse

from users.models import UserORM
from users.schemas import UserStatus
from databases.sqlalchemy import SessionDep


class ShopService:

    @staticmethod
    async def create_shop(
        user: UserORM,
        form: ShopCreateForm,
        db: SessionDep
    ) -> ShopORM:

        shop = await ShopORM.create(form, db=db)
        await shop.grant_access(user.id, db)
        return shop

    @staticmethod
    async def update_shop(
            shop: ShopORM,
            form: ShopUpdateForm,
            db: SessionDep
    ) -> None:

        await shop.update(form, db)

    @staticmethod
    async def get_shops(
        user: UserORM,
        db: SessionDep
    ) -> Sequence[ShopORM]:

        if user.status == UserStatus.OWNER:
            shops = await ShopORM.get_all(db)
        else:
            shops = await ShopORM.get_for_user(user.id, db)

        return shops

    @staticmethod
    async def get_access(
        shop: ShopORM,
        db: SessionDep
    ) -> ShopAccessResponse:

        user_ids = await shop.list_user_ids(db)
        return ShopAccessResponse(shop_id=shop.id, user_ids=user_ids)

    @staticmethod
    async def get_self_access(
        user: UserORM,
        db: SessionDep
    )-> UserAccessResponse:

        user_id = user.id
        shop_ids = await ShopORM.list_shop_ids(user_id, db)
        return UserAccessResponse(user_id=user_id, shop_ids=shop_ids)

    @staticmethod
    async def grant_access(
        shop: ShopORM,
        user_id: UUID,
        db: SessionDep
    ) -> None:

        if await shop.check_access(user_id, db):
            return

        await shop.grant_access(user_id, db)

    @staticmethod
    async def revoke_access(
        shop: ShopORM,
        user_id: UUID,
        db: SessionDep
    )-> None:

        await shop.revoke_access(user_id, db)
