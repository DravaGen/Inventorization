from typing import Type, TypeVar, Optional, Iterator
from pydantic import BaseModel, model_validator
from fastapi.responses import JSONResponse


RESPONSE_MODEL = TypeVar("MODEL", bound=BaseModel)


class TextResponse(BaseModel):
    detail: str


class ResponseOK(JSONResponse):

    def __init__(
        self,
        detail: str,
        status_code: int = 200,
    ):
        # content = BaseResponseContent(detail) if type(detail) == str else detail
        super().__init__(
            TextResponse(detail=detail).model_dump(),
            status_code, None, None, None
        )


class ResponseDescription(BaseModel):
    status_code: int
    model: Optional[Type[str] | RESPONSE_MODEL] = None
    description: Optional[str] = None

    @model_validator(mode="after")
    def validate_empty(self):

        if (
            not len(
                self.model_dump(
                    exclude="status_code",
                    exclude_unset=True
                ).values()
            ) != 0
        ):
            raise ValueError(f"response code {self.status_code} not field")

        if self.model == str:
            self.model = TextResponse(detail="string")

        return self


class ResponseDescriptions(BaseModel):
    responses: tuple[ResponseDescription, ...]


    def __init__(
            self,
            responses: tuple[ResponseDescription, ...]
    ):
        super().__init__(responses=responses)
        self.__responses = self.__forming()


    def __forming(self) -> dict[int, dict]:

        response = {}

        for x in self.responses:
            response[x.status_code] = x.model_dump(
                exclude=["status_code", "model"],
                exclude_unset=True
            )

            if x.model:
                response[x.status_code]["model"] = x.model

        return response


    def __call__(self, *args, **kwds) -> dict[int, dict]:
        return self.__forming()


    def keys(self):
        return self.__responses.keys()


    def __getitem__(self, key: int) -> dict:
        return self.__responses[key]


    def __iter__(self) -> Iterator:
        return iter(self.__responses)


    def __len__(self) -> int:
        return len(self.__responses)
