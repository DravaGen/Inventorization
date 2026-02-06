from uuid import UUID
from fastapi import APIRouter, HTTPException, status

from sqlalchemy import select, insert, update

from .models import UserORM
from .schemas import UserSignupForm, UserUpdateForm, EMAIL, \
    GetUserRequest, UserResponse
from .services import get_user

from responses import ResponseOK, ResponseDescriptions, ResponseDescription
from auth.services import UserStatusISOwner
from databases.sqlalchemy import SessionDep


users_router = APIRouter()


@users_router.post(
    "/",
    dependencies=[UserStatusISOwner],
    responses=ResponseDescriptions((
        ResponseDescription(
            status_code=status.HTTP_409_CONFLICT,
            description="You can't create a user " \
                "because it already exists."
        ),
    ))
)
async def signup_user(
        form_data: UserSignupForm,
        db: SessionDep
) -> ResponseOK:
    """Регистрирует пользотеля"""

    if await get_user(form_data.email, db):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You can't create a user"
        )

    await db.execute(
        insert(UserORM)
        .values(**form_data.model_dump())
    )

    return ResponseOK(detail="user signuped")


@users_router.patch(
    "/",
    dependencies=[UserStatusISOwner],
    responses=ResponseDescriptions((
        ResponseDescription(
            status_code=status.HTTP_404_NOT_FOUND,
            description="You cannot update the user's data " \
                "because he is not registered"
        ),
    ))
)
async def update_user(
        email: EMAIL,
        form_data: UserUpdateForm,
        db: SessionDep
) -> ResponseOK:
    """Обновляет пользотеля"""

    if not await get_user(email, db):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You cannot update the user's data"
        )

    await db.execute(
        update(UserORM)
        .values(**form_data.model_dump(exclude_unset=True))
        .where(UserORM.email == email)
    )

    return ResponseOK(detail="user updated")


@users_router.post(
    "/get",
    dependencies=[UserStatusISOwner],
)
async def get_users(
        db: SessionDep,
        data: GetUserRequest
) -> list[UserResponse]:
    """"""

    query = select(UserORM)

    if data.user_ids:
        query = query.where(UserORM.id.in_(data.user_ids))

    result = await db.execute(query)
    users = result.scalars().all()
    return [UserResponse.model_validate(x) for x in users]
