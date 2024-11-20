from .schemas import UserSignupForm, UserUpdateForm
from security.users import hash_password


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
