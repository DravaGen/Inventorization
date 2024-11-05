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


class JWTConfig:
    """Настройки JWT"""

    DIR = Path(Config.BASE_DIR, "auth", "jwt")
    PRIVATE_KEY = Path(DIR, "private.pem").read_text()
    PUBLIC_KEY = Path(DIR, "public.pem").read_text()
