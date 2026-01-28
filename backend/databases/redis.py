from redis.client import Redis
from config import RedisConfig


def get_redis() -> Redis:
    """Подключение к redis"""

    cursor = Redis(
        host=RedisConfig.HOST,
        port=RedisConfig.PORT,
        decode_responses=True,  # Переводит данные из байт-кода
    )
    return cursor
