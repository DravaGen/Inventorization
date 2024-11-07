from pydantic import BaseModel


class ResponseOK(BaseModel):
    detail: str = "ok"
