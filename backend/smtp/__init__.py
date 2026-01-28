import smtplib
from uuid import UUID
from config import SMTPConfig, OTPConfig
from auth.otp import OTPService
from databases.redis import get_redis


class SMTPDelayError(Exception):

    def __init__(self, delay, *args):
        self.delay = delay
        super().__init__(*args)

    def __str__(self):
        return f"Too Many Requests, wait in {self.delay} sec"


class SMTPServer:

    def __init__(self):
        self.smtp_obj = smtplib.SMTP(f"smtp.{SMTPConfig.DOMEN}", SMTPConfig.PORT)
        self.smtp_obj.starttls()
        self.smtp_obj.login(SMTPConfig.EMAIL, SMTPConfig.PASSWORD)


    def __del__(self):
        self.smtp_obj.quit()


    def send_text(self, email: str, message: str) -> None:
        self.smtp_obj.sendmail(SMTPConfig.EMAIL, email, message)


    def send_otp_code(self, user_id: UUID, email: str) -> None:

        with get_redis() as redis:
            delay = redis.ttl(f"{user_id}:smtp_otp_delay")

            if delay > 0:
                raise SMTPDelayError(delay)

            redis.set(f"{user_id}:smtp_otp_delay", 1, OTPConfig.DELAY)

        code = OTPService.issue_code(user_id)
        self.send_text(email, f"Your code: {code}")
