import time

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .jwt import JWTService
from .schemas import AccessTokenData, AccessTokenResponse
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

    access_token = JWTService.encode(
        AccessTokenData(
            sub=user.id, status=user.status
        ).model_dump(mode="json")
    )

    return AccessTokenResponse(access_token=access_token)
