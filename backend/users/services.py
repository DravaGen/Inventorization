from uuid import UUID
from typing import Sequence

from fastapi import HTTPException, status
from sqlalchemy import insert, update, select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import UserORM
from .schemas import UserSignupForm, UserUpdateForm, GetUserRequest


class UserService:

    @staticmethod
    async def signup(
        form: UserSignupForm,
        db: AsyncSession
    ) -> None:

        if await UserORM.get_by_email(form.email, db):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You can't create a user"
            )

        await db.execute(insert(UserORM).values(**form.model_dump()))

    @staticmethod
    async def update(
        email: str,
        form: UserUpdateForm,
        db: AsyncSession
    ) -> None:

        if not await UserORM.get_by_email(email, db):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="You cannot update the user's data"
            )

        await db.execute(
            update(UserORM)
            .values(**form.model_dump(exclude_unset=True))
            .where(UserORM.email == email)
        )

    @staticmethod
    async def get_users(
        db: AsyncSession,
        user_ids: list[UUID] | None = None
    ) -> Sequence[UserORM]:
        query = select(UserORM).order_by(UserORM.id)

        if user_ids:
            query = query.where(UserORM.id.in_(user_ids))

        result = await db.execute(query)
        users = result.scalars().all()

        return users
