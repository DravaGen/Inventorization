from typing import AsyncIterator

from sqlalchemy import MetaData
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

from config import Config, PostgresSQLConfig


engine = create_async_engine(
    PostgresSQLConfig.SQLALCHEMY_URL,
    echo=Config.DEBUG
)
metadata = MetaData()

Base = declarative_base(metadata=metadata)


def get_enum_values(enum):
    """Получает значения Enum чтобы хранились в нижнем регистре"""

    return [x.value for x in enum]


def session_factory() -> AsyncSession:
    """Создаёт новую асинхронную сессию"""

    return sessionmaker(
        bind=engine,
        class_=AsyncSession
    )()


async def get_db() -> AsyncIterator[AsyncSession]:
    """Управляет жизненным циклом сессии, используя асинхронный генератор"""

    session = session_factory()
    try:
        yield session
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()
