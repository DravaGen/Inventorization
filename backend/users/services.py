from abc import ABC


class AuthUser(ABC):

    @staticmethod
    def login():
        """"""

    @staticmethod
    def get_user_id_soft():
        """"""

    @staticmethod
    def get_user_id():
        """"""

    @staticmethod
    def get_user_status():
        """"""

    @staticmethod
    def check_min_status():
        """"""


class WorkerService(AuthUser):

    def add_item_cart() -> None:
        """"""

    def delete_item_cart() -> None:
        """"""


class AdminService(WorkerService):

    def add_item() -> None:
        """"""

    def delete_item() -> None:
        """"""

    def banned_user() -> None:
        """"""


class OwnerService(AdminService):

    def signup_user() -> None:
        """"""

    def delete_user() -> None:
        """"""

    def update_user() -> None:
        """"""
