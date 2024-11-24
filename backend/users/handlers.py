from fastapi import APIRouter

from sqlalchemy import insert, update

from .models import UserORM
from .schemas import UserSignupForm, UserUpdateForm, EMAIL
from .services import process_user_form

from responses import ResponseOK
from auth.services import UserStatusISOwner
from databases.sqlalchemy import SessionDep


users_router = APIRouter()


@users_router.post(
    "/",
    dependencies=[UserStatusISOwner]
)
async def signup_user(
        form_data: UserSignupForm,
        db: SessionDep
) -> ResponseOK:
    """Регистрирует пользотеля"""

    process_user_form(form_data)
    await db.execute(
        insert(UserORM)
        .values(**form_data.model_dump())
    )

    return ResponseOK(detail="user signuped")


@users_router.patch(
    "/",
    dependencies=[UserStatusISOwner]
)
async def update_user(
        email: EMAIL,
        form_data: UserUpdateForm,
        db: SessionDep
) -> ResponseOK:
    """Обновляет пользотеля"""

    process_user_form(form_data)
    await db.execute(
        update(UserORM)
        .values(**form_data.model_dump(exclude_unset=True))
        .where(UserORM.email == email)
    )

    return ResponseOK(detail="user updated")
