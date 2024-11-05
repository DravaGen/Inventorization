import jwt
from config import JWTConfig


class JWTService:

    @staticmethod
    def encode(payload: dict) -> str:
        """Возвращает jwt token подписанный сервером"""

        return jwt.encode(
            payload,
            JWTConfig.PRIVATE_KEY,
            algorithm="RS256"
        )

    @staticmethod
    def decode(token: str) -> dict:
        """Возвращает данные внутрит token и проверяет подпись"""

        return jwt.decode(
            token,
            JWTConfig.PUBLIC_KEY,
            algorithms=["RS256"]
        )
