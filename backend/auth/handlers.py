from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .jwt import JWTService
from .otp import OTPService
from .schemas import AccessTokenData, AccessTokenResponse
from smtp import SMTPServer, SMTPDelayError
from users.models import UserORM
from users.services import get_user
from security.users import validate_hash_password
from databases.sqlalchemy import get_db
from responses import ResponseOK, ResponseDescriptions, ResponseDescription


auth_router = APIRouter()


@auth_router.post("/login")
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
        user is None
        or not validate_hash_password(
            form_data.password, user.password
        )
        and not OTPService.validate_code(
            user.id, form_data.password
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


@auth_router.get(
    "/otp",
    status_code=202,
    responses=ResponseDescriptions((
        ResponseDescription(
            status_code=404,
            description="User not found"
        ),
        ResponseDescription(
            status_code=429,
            description="Too Many Requests, wait in {x} sec"
        ),
    ))
)
async def send_otp_code(
        email: str,
        db: AsyncSession = Depends(get_db)
) -> ResponseOK:
    """"""
    user = await get_user(email, db)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    try:
        SMTPServer().send_otp_code(user.id, email)

    except SMTPDelayError as error:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"message": str(error), "delay": error.delay}
        )

    return ResponseOK(detail="otp code sended", status_code=202)
