from typing import AsyncIterator, Annotated

from fastapi import Depends
from pydantic import Field

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


def convert_query_to_list_dicts(schema_class, data):
    """
        Преобразует результат запроса SELECT в список dicts
        https://stackoverflow.com/questions/19406859
    """

    return [
        schema_class.model_validate(x)
        for x in map(lambda q: q._asdict(), data)
    ]


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
        await session.commit()
    except:
        await session.rollback()
        raise
    finally:
        await session.close()


SessionDep = Annotated[AsyncSession, Depends(get_db)]
PositiveIntField = Annotated[int, Field(ge=1, le=2_147_483_647)]
