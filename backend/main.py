from typing import get_type_hints
from fastapi import FastAPI, APIRouter
from responses import ResponseOK, TextResponse

from config import Config
from auth.handlers import auth_router
from users.handlers import users_router
from shops.handlers import shops_router
from items.handlers import items_router


root_router = APIRouter()

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


def openapi_prestart() -> None:

    for route in root_router.routes:
        if (
            get_type_hints(
                route.__dict__["endpoint"]
            ).get("return") == ResponseOK
        ):
            setattr(route, "response_model", TextResponse)


openapi_prestart()
app = FastAPI(
    debug=Config.DEBUG
)
app.include_router(root_router)
