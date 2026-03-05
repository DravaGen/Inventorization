from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse

from pydantic import EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from redis.client import Redis

from .jwt import JWTService
from .otp import OTPService
from .schemas import AccessTokenData, AccessTokenResponse
from smtp import SMTPServer, SMTPDelayError, SMTPDelayErrorResponse
from users.models import UserORM
from users.schemas import UserStatus
from databases.sqlalchemy import get_db
from databases.redis import get_redis
from responses import ResponseOK, ResponseDescriptions, ResponseDescription


auth_router = APIRouter()


@auth_router.post("/login")
async def login(
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: AsyncSession = Depends(get_db),
        redis: Redis = Depends(get_redis)
) -> AccessTokenResponse:

    user = await db.execute(
        select(UserORM)
        .where(UserORM.email == form_data.username)
    )
    user = user.scalar()

    if (
        user is None
        or not OTPService.validate_code(
            user.id, form_data.password, redis
        )
        or user.status == UserStatus.BANNED
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = JWTService.encode(
        AccessTokenData.create(
            sub=user.id, status=user.status
        ).model_dump(mode="json")
    )

    return AccessTokenResponse(access_token=access_token)


@auth_router.get(
    "/send-otp",
    status_code=status.HTTP_202_ACCEPTED,
    responses=ResponseDescriptions((
        ResponseDescription(
            status_code=status.HTTP_404_NOT_FOUND,
            description="User not found"
        ),
        ResponseDescription(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            model=SMTPDelayErrorResponse,
            description="Too Many Requests, wait in {x} sec"
        )
    ))
)
async def send_otp_code(
        email: EmailStr,
        db: AsyncSession = Depends(get_db),
        redis: Redis = Depends(get_redis)
) -> JSONResponse:
    """"""
    user = await UserORM.get_by_email(email, db)

    if user and user.status != UserStatus.BANNED:
        try:
            await SMTPServer().send_otp_code(user.id, email, redis)

        except SMTPDelayError as error:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content=error.response.model_dump()
            )

    return ResponseOK(
        detail="otp code sended",
        status_code=status.HTTP_202_ACCEPTED
    )
