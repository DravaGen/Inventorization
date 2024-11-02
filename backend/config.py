import os
from dotenv import load_dotenv
from distutils.util import strtobool


load_dotenv()


class Config:
    """Общие настройки проекта"""

    DEBUG = strtobool(os.getenv("DEBUG"))


class PostgresSQLConfig:
    """Настройки PostgreSQL"""

    USER = os.getenv("POSTGRESQL_USER")
    PASSWORD = os.getenv("POSTGRESQL_PASSWORD")
    HOST = os.getenv("POSTGRESQL_HOST")
    PORT = os.getenv("POSTGRESQL_PORT")
    DATABASE = os.getenv("POSTGRESQL_DATABASE")

    SQLALCHEMY_URL = f"postgresql+asyncpg://{USER}:{PASSWORD}" \
                    f"@{HOST}:{PORT}/{DATABASE}"
