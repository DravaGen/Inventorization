from .schemas import UserSignupForm, UserUpdateForm, UserSoftSchema
from security.users import hash_password


def get_user_soft_data(
        user_data: UserSignupForm | UserUpdateForm
) -> UserSoftSchema:
    """
        Выполняет дополнительные действия с данными
        перед обновление и добавление пользователя
    """

    schema = UserSoftSchema.model_validate(user_data)

    if user_data.password:
        schema.password = hash_password(user_data.password)

    return schema

