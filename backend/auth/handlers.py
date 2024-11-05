import time

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .jwt import JWTService
from .schemas import AccessTokenResponse
from users.models import UserORM
from security.users import validate_hash_password
from databases.sqlalchemy import get_db


auth_router = APIRouter()


@auth_router.post("/login", response_model=AccessTokenResponse)
async def login(
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: AsyncSession = Depends(get_db)
) -> AccessTokenResponse:

    user = await db.execute(
        select(UserORM)
        .where(UserORM.email == form_data.username)
    )
    user = user.scalar()

    if (
        user is None or
        not validate_hash_password(
            form_data.password, user.password
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = JWTService.encode({
        "sub": str(user.id),
        "status": user.status.value,
        "exp": int(time.time() + 12*60*60)  # Токен действителен 12 часов
    })

    return AccessTokenResponse(access_token=access_token)
