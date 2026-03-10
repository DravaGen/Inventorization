from typing import get_type_hints
from fastapi import FastAPI, APIRouter, status
from starlette.routing import BaseRoute
from fastapi.middleware.cors import CORSMiddleware
from fastapi.dependencies.models import Dependant
from responses import ResponseOK, TextResponse, \
    ResponseDescriptions, ResponseDescription

from config import Config
from auth.handlers import auth_router
from users.handlers import users_router
from shops.handlers import shops_router, shops_access_router
from items.handlers import items_router

from auth.services import check_user_min_status


root_router = APIRouter()

shops_router.include_router(
    shops_access_router,
    prefix="/access",
    tags=["Shops Access"]
)

root_router.include_router(
    auth_router,
    tags=["Auth"],
    include_in_schema=Config.DEBUG
)
root_router.include_router(
    users_router,
    prefix="/users",
    tags=["Users"]
)
root_router.include_router(
    shops_router,
    prefix="/shops",
    tags=["Shop"]
)
root_router.include_router(
    items_router,
    prefix="/items",
    tags=["Items"]
)


def openapi_depends(route: BaseRoute,  dep: Dependant) -> None:

    dep_name = dep.call.__qualname__ if (
        type(dep.call) == type(check_user_min_status)
    ) else str(dep.call)

    if check_user_min_status.__name__ in dep_name:
        responses = getattr(route, "responses")
        descript = ResponseDescriptions((
            ResponseDescription(
                status_code=status.HTTP_403_FORBIDDEN,
                model=str,
                description="Access is denied. " \
                    "Privileges are less than necessary."
            ),
        ))
        responses[403] = descript[403]

    if bool(len(dep.dependencies)):
        openapi_depends(route, dep.dependencies[0])


def openapi_prestart() -> None:

    for route in root_router.routes:
        if (
            get_type_hints(
                getattr(route, "endpoint")
            ).get("return") == ResponseOK
        ):
            setattr(route, "response_model", TextResponse)

        for response_codes, data in getattr(route, "responses").items():
            if 400 <= response_codes <= 500:
                data["model"] = TextResponse if not data.get("model") else data["model"]

        openapi_depends(route, route.__dict__["dependant"])


openapi_prestart()
app = FastAPI(debug=Config.DEBUG)
app.include_router(root_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*" if Config.DEBUG else r'https?://localhost:[0-9]{1,5}'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
