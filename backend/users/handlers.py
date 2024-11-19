from fastapi import APIRouter

from sqlalchemy import insert, update

from .models import UserORM
from .schemas import UserSignupForm, UserUpdateForm
from .services import get_user_soft_data

from responses import ResponseOK
from auth.services import UserStatusISWorker
from databases.sqlalchemy import SessionDep


users_router = APIRouter()


@users_router.post(
    "/",
    dependencies=[UserStatusISWorker]
)
async def signup_user(
        form_data: UserSignupForm,
        db: SessionDep
) -> ResponseOK:
    """Регистрирует пользотеля"""

    schema = get_user_soft_data(form_data)
    await db.execute(
        insert(UserORM)
        .values(**schema.model_dump())
    )

    return ResponseOK(detail="user signuped")


@users_router.put(
    "/",
    dependencies=[UserStatusISWorker]
)
async def update_user(
        form_data: UserUpdateForm,
        db: SessionDep
) -> ResponseOK:
    """Обновляет пользотеля"""

    schema = get_user_soft_data(form_data)
    await db.execute(
        update(UserORM)
        .values(**schema.model_dump(exclude_unset=True))
    )

    return ResponseOK(detail="user updated")
