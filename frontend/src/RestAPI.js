

const SERVER_URL = "http://localhost:8000"
const TRFNSLATION_API_ERROR = {
    "invalid email or password": "Неправильный адрес почты или пароль",
    "otp code sended": "Одноразовый код отправлен",
    "user not found": "Пользователь не найден",
    "not shop access": "Нет доступа к магазину",
    "not enough rights": "Недостаточно прав",
    "item deleted": "Товар удален",
    "it is not possible to delete an item because it is associated with other data.":
        "Невозможно удалить товар из магазина, потому что товар значится в других данных",
    "exceed available quantity": "Превышает возможное количество",
    "item added to cart": "Товар добавлен в корзину",
    "you can't delete an item from the cart.": "Вы не можете удалить товар из корзины",
    "item deleted from cart": "Товар удален из корзины",
    "cleaned cart": "Корзина очищена",
    "the shopping cart is empty.": "Корзина пустая",
    "there is not enough product in the store.": "Недостаточно продуктов на складе",
    "purchase been confirmed": "Покупка подтверждена",
    "item not found": "Товар не найден",
    "item in shop not found": "В магазине товар не найден",
    "item added to queue": "Товар добавлен в очередь",
    "item added to shop": "Товар добавлен в магазин",
    "access rights cannot be granted": "Нельзя выдать права доступа",
    "access granted": "Доступ выдан",
    "access revoked": "Доступ отозван",
    "you can't create a user": "Вы не можете создать пользователя",
    "user signuped": "Пользователь зарегистрирован",
    "you cannot update the user's data": "Вы не можете обновить пользовательские данные",
    "user updated": "Данные пользователя обновлены",
    "cant connect to server": "Не удается подключиться к серверу",
    "internal server error": "Внутренняя ошибка сервера"
}

const TRFNSLATION_API_ERROR_KEYS = Object.keys(TRFNSLATION_API_ERROR)


class RestAPI {

    static async handleError(error) {
        const body = await error.text();

        if (error.status === 500) {
            // Internal server error
            return {detail: "Internal Server Error"};
        } else if (body) {
            // Server returned error description
            return JSON.parse(body);
        } else {
            // Unknown errors
            return error;
        }
    }

    static notif_type(response) {
        const status = response?.status

        if (response?.ok) {
            return "info"
        }

        if ([404, 409].includes(status)) {
            return "warning"
        }

        return "error"

    }

    static notif_message(response_data) {
        const detail = response_data?.detail

        if (!detail) {
            return null
        }

        if (TRFNSLATION_API_ERROR_KEYS.includes(detail.toLowerCase())) {
            return TRFNSLATION_API_ERROR[detail.toLowerCase()]
        }

        return detail
    }

    static async _makeRequest(url, args) {
        args.signal = this._timeout(5000).signal;
        // args.credentials = 'include'

        if(!args.headers) {
            args.headers = {}
        }

        // const accessToken = store.getState().global.accessToken;
        // if (accessToken) {
        //     args.headers['Authorization'] = `Bearer ${accessToken}`
        // }

        if (args.json) {
            args.headers['Content-Type'] = 'application/json';
            args.body = JSON.stringify(args.json);
            delete args.json;
        }

        const server_response = await fetch(url, args)
            .then(async (response) => {
                let obj = {response: response}
                if (response.ok) {
                    obj.data = await response.json()
                } else {
                    obj.data = await this.handleError(response)
                }
                return obj
            })
            .catch(() => {
                return {
                    status: null,
                    data: {detail: "Cant connect to server"},
                    response: null
                }
            })
        const response = server_response.response

        return {
            status: response?.status,
            data: server_response.data,
            type: this.notif_type(response),
            message: this.notif_message(server_response.data)
        }

    }

    static _timeout (time) {
        let controller = new AbortController();
        setTimeout(() => controller.abort(), time);
        return controller;
    };


    static async sendOtp(email) {
        return await this._makeRequest(
            `${SERVER_URL}/send-otp?email=${email}`,
            {method: "GET"}
        )
    }

    static async login(username, password) {
        let formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        return await this._makeRequest(
            SERVER_URL + '/login',
            {
                method: 'POST',
                body: formData
            }
        )
    }

}

export default RestAPI;
