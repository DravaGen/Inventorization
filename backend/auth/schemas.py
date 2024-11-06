from time import time
from uuid import UUID
from pydantic import BaseModel

from users.schemas import UserStatus


class AccessTokenData(BaseModel):
    """Данные которые хранятся в JWT"""

    sub: UUID  # user_id
    status: UserStatus  # user_status
    exp: int = int(time() + 12*60*60)  # Токен действителен 12 часов


class AccessTokenResponse(BaseModel):

    access_token: str
    token_type: str = "bearer"
