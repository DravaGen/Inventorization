import random
from uuid import UUID
from config import OTPConfig
from redis.client import Redis
from databases.redis import get_redis


class OTPService:

    @staticmethod
    def generate_opt() -> str:
        """Генерация одноразового кода"""

        return "".join(random.choices("0123456789", k=OTPConfig.CODE_LENGTH))


    @staticmethod
    def issue_code(user_id: UUID, redis: Redis) -> str:
        """Выдача кода пользователю"""

        code = OTPService.generate_opt()
        redis.set(f"{user_id}:otpcode", code, OTPConfig.LIFETIME)

        return code


    @staticmethod
    def validate_code(user_id: UUID, code: str, redis: Redis) -> bool:
        """Проверка одноразового кода"""

        saved_code = redis.get(f"{user_id}:otpcode")
        redis.delete(f"{user_id}:otpcode")

        return code == saved_code
