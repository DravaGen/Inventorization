from fastapi import FastAPI

from config import Config
from auth.handlers import auth_router
from users.handlers import users_router
from shops.handlers import shops_router
from items.handlers import items_router


app = FastAPI(
    debug=Config.DEBUG
)
app.include_router(
    auth_router,
    tags=["Auth"],
    include_in_schema=Config.DEBUG
)
app.include_router(
    users_router,
    prefix="/users",
    tags=["Users"]
)
app.include_router(
    shops_router,
    prefix="/shops",
    tags=["Shop"]
)
app.include_router(
    items_router,
    prefix="/items",
    tags=["Items"]
)
