import os
from dotenv import load_dotenv
from pathlib import Path
from distutils.util import strtobool


load_dotenv()


class Config:
    """Общие настройки проекта"""

    DEBUG = strtobool(os.getenv("DEBUG"))
    BASE_DIR = Path.cwd()


class PostgresSQLConfig:
    """Настройки PostgreSQL"""

    USER = os.getenv("POSTGRESQL_USER")
    PASSWORD = os.getenv("POSTGRESQL_PASSWORD")
    HOST = os.getenv("POSTGRESQL_HOST")
    PORT = os.getenv("POSTGRESQL_PORT")
    DATABASE = os.getenv("POSTGRESQL_DATABASE")

    SQLALCHEMY_URL = f"postgresql+asyncpg://{USER}:{PASSWORD}" \
                    f"@{HOST}:{PORT}/{DATABASE}"


class RedisConfig:
    """Настройки Redis"""

    HOST = os.getenv("REDIS_HOST")
    PORT = os.getenv("REDIS_PORT")


class JWTConfig:
    """Настройки JWT"""

    DIR = Path(Config.BASE_DIR, "auth", "jwt")
    PRIVATE_KEY = Path(DIR, "private.pem").read_text()
    PUBLIC_KEY = Path(DIR, "public.pem").read_text()


class OTPConfig:
    """Настройки OTP-верификации"""

    CODE_LENGTH = 6  # Длина кода
    LIFETIME = 300  # Время жизни в секундах
    DELAY = 60  # Задержка между отправками в секундах


class SMTPConfig:
    """Настройки SMTP"""

    EMAIL = os.getenv("SMTP_EMAIL")
    DOMEN = EMAIL.split("@")[1]
    PASSWORD = os.getenv("SMTP_PASSWORD")
    PORT = int(os.getenv("SMTP_PORT"))
