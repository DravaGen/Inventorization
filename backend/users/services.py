from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import UserORM
from .schemas import UserSignupForm, UserUpdateForm
from security.users import hash_password



async def get_user(
        email: str,
        db: AsyncSession
) -> UserORM | None:
    """Повращает пользователя по email"""

    user = await db.execute(
        select(UserORM)
        .where(UserORM.email == email)
    )
    return user.scalar()


def process_user_form(
        form_data: UserSignupForm | UserUpdateForm
) -> None:
    """
        Обрабатывает данные формы.
        Выполняет дополнительную логику, такую как хеширование пароля.
        Может быть расширена для выполнения других операций.
    """

    if form_data.password:
        form_data.password = hash_password(form_data.password)
