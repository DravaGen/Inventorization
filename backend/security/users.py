import bcrypt


def hash_password(password: str) -> str:
    """Возвращает хэш пароля"""

    return bcrypt.hashpw(
        password.encode(),
        bcrypt.gensalt()
    ).decode()


def validate_hash_password(
        password: str,
        hashed_password: str
) -> bool:
    """Проверяет хэш пароля"""

    return bcrypt.checkpw(
        password.encode(),
        hashed_password.encode()
    )
