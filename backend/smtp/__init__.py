# import smtplib
from uuid import UUID
from pydantic import BaseModel
from smtplibaio import SMTP

from config import SMTPConfig, OTPConfig
from auth.otp import OTPService
from redis.client import Redis


class SMTPDelayErrorResponse(BaseModel):
    detail: str
    delay: int


class SMTPDelayError(Exception):

    def __init__(self, delay, *args):
        self.delay = delay
        super().__init__(*args)


    @property
    def message(self) -> str:
        return f"Too Many Requests, wait in {self.delay} sec"


    def __str__(self):
        return self.message


    @property
    def response(self) -> SMTPDelayErrorResponse:
        return SMTPDelayErrorResponse(
            detail=self.message,
            delay=self.delay
        )


class SMTPServer:

    def __init__(self):
        pass


    async def send_text(self, email: str, message: str) -> None:

        client = SMTP(f"smtp.{SMTPConfig.DOMEN}", SMTPConfig.PORT, use_aioopenssl=True)
        await client.connect()
        await client.starttls()
        await client.auth(SMTPConfig.EMAIL, SMTPConfig.PASSWORD)
        await client.sendmail(SMTPConfig.EMAIL, email, message)
        await client.quit()


    async def send_otp_code(self, user_id: UUID, email: str, redis: Redis) -> None:

        delay = redis.ttl(f"{user_id}:smtp_otp_delay")

        if delay > 0:
            raise SMTPDelayError(delay)

        redis.set(f"{user_id}:smtp_otp_delay", 1, OTPConfig.DELAY)

        code = OTPService.issue_code(user_id, redis)
        await self.send_text(email, f"Your code: {code}")
