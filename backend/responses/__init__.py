from fastapi import status
from typing import Any, Type, TypeVar, Optional
from pydantic import BaseModel, model_validator
from fastapi.responses import JSONResponse


RESPONSE_MODEL = TypeVar("RESPONSE_MODEL", bound=BaseModel)


class TextResponse(BaseModel):
    detail: str


class ResponseOK(JSONResponse):

    def __init__(
        self,
        detail: str,
        status_code: int = status.HTTP_200_OK,
    ):
        # content = BaseResponseContent(detail) if type(detail) == str else detail
        super().__init__(
            TextResponse(detail=detail).model_dump(),
            status_code, None, None, None
        )


class ResponseDescription(BaseModel):
    status_code: int
    model: Optional[Type[str] | type[BaseModel]] = None
    description: Optional[str] = None

    @model_validator(mode="after")
    def validate_empty(self):

        if (
            not len(
                self.model_dump(
                    exclude={"status_code"},
                    exclude_unset=True
                ).values()
            ) != 0
        ):
            raise ValueError(f"response code {self.status_code} not field")

        if self.model == str:
            self.model = TextResponse

        return self


class ResponseDescriptions(dict[int | str, dict[str, Any]]):

    def __init__(
        self,
        responses: tuple[ResponseDescription, ...]
    ):
        super().__init__(self.__forming(responses))


    def __forming(
        self,
        responses: tuple[ResponseDescription, ...]
    ) -> dict[int | str, dict[str, Any]]:

        result: dict[int | str, dict[str, Any]] = {}

        for x in responses:
            result[x.status_code] = x.model_dump(
                exclude={"status_code", "model"},
                exclude_unset=True
            )

            if x.model:
                result[x.status_code]["model"] = x.model

        return result
