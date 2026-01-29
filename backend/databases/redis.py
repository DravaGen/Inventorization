from redis.client import Redis
from typing import AsyncIterator
from config import RedisConfig


async def get_redis() -> AsyncIterator[Redis]:
    """Подключение к redis"""

    session = Redis(
        host=RedisConfig.HOST,
        port=RedisConfig.PORT,
        decode_responses=True,  # Переводит данные из байт-кода
    )

    try:
        yield session

    finally:
        session.close()
