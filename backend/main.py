from fastapi import FastAPI

from config import Config
from auth.handlers import auth_router
from shops.handlers import shops_router

app = FastAPI(
    debug=Config.DEBUG
)
app.include_router(
    auth_router,
    tags=["Auth"],
    include_in_schema=Config.DEBUG
)
app.include_router(
    shops_router,
    prefix="/shops",
    tags=["Shop"]
)
