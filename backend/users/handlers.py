from fastapi import APIRouter, status

from pydantic import EmailStr

from .schemas import UserSignupForm, UserUpdateForm, \
    GetUserRequest, UserResponse
from .services import UserService

from responses import ResponseDescriptions, ResponseDescription
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
    form: UserSignupForm,
    db: SessionDep
) -> None:
    """ Регистрирует нового пользователя в системе"""

    await UserService.signup(form, db)


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
    email: EmailStr,
    form: UserUpdateForm,
    db: SessionDep
) -> None:
    """Обновляет данные существующего пользователя"""

    await UserService.update(email, form, db)


@users_router.post(
    "/get",
    dependencies=[UserStatusISOwner],
)
async def get_users(
    db: SessionDep,
    data: GetUserRequest
) -> list[UserResponse]:
    """Возвращает список пользователей в формате UserResponse"""

    users = await UserService.get_users(db, data.user_ids)
    return [UserResponse.model_validate(x) for x in users]
