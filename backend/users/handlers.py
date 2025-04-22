from fastapi import APIRouter, HTTPException

from sqlalchemy import insert, update

from .models import UserORM
from .schemas import UserSignupForm, UserUpdateForm, EMAIL
from .services import get_user, process_user_form

from responses import ResponseOK, ResponseDescriptions, ResponseDescription
from auth.services import UserStatusISOwner
from databases.sqlalchemy import SessionDep


users_router = APIRouter()


@users_router.post(
    "/",
    dependencies=[UserStatusISOwner],
    responses=ResponseDescriptions((
        ResponseDescription(
            status_code=409,
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
            status_code=409,
            detail="You can't create a user"
        )

    process_user_form(form_data)
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
            status_code=404,
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
            status_code=404,
            detail="You cannot update the user's data"
        )

    process_user_form(form_data)
    await db.execute(
        update(UserORM)
        .values(**form_data.model_dump(exclude_unset=True))
        .where(UserORM.email == email)
    )

    return ResponseOK(detail="user updated")
