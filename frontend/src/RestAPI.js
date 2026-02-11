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

const UserStatus = Object.freeze({
    WORKER: "worker",
    ADMIN: "admin",
    OWNER: "owner",
});

const weightsUserStatus = {
    [UserStatus.WORKER]: 50,
    [UserStatus.ADMIN]: 80,
    [UserStatus.OWNER]: 100,
};


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

        if (
            typeof detail == "string"
            && TRFNSLATION_API_ERROR_KEYS.includes(detail.toLowerCase())
        ) {
            return TRFNSLATION_API_ERROR[detail.toLowerCase()]
        }

        return JSON.stringify(detail)
    }

    static checkUserMinStatus(userStatus, minStatus) {
        if (weightsUserStatus[userStatus] < weightsUserStatus[minStatus]) {
            return false
        }
        return true
    }

    static async _makeRequest(url, args) {
        args.signal = this._timeout(5000).signal;
        // args.credentials = 'include'

        if(!args.headers) {
            args.headers = {}
        }

        const accessToken = localStorage?.access_token;
        if (accessToken) {
            args.headers['Authorization'] = `Bearer ${accessToken}`
        }

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
                    ok: false,
                    status: null,
                    data: {detail: "Cant connect to server"},
                    response: null
                }
            })
        const response = server_response.response

        return {
            ok: response?.ok,
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
            `${SERVER_URL}/login`,
            {
                method: 'POST',
                body: formData
            }
        )
    }

    static async get_shops() {
        return await this._makeRequest(
            `${SERVER_URL}/shops/list`,
            {method: "GET"}
        )
    }

    static async signup_user(email, status) {
        let formData = new FormData();
        formData.append('email', email);
        formData.append('status', status);

        return await this._makeRequest(
            `${SERVER_URL}/users/`,
            {
                method: 'POST',
                body: formData
            }
        )
    }

    static async update_user(email, status) {
        let formData = new FormData();
        formData.append('status', status);

        return await this._makeRequest(
            `${SERVER_URL}/users/?email=${email}`,
            {
                method: 'PATCH',
                body: formData
            }
        )
    }

    static async create_shop(name, address) {
        let formData = new FormData();
        formData.append('name', name);
        formData.append('address', address);

        return await this._makeRequest(
            `${SERVER_URL}/shops/`,
            {
                method: 'POST',
                body: formData
            }
        )
    }

    static async get_access(shopId) {
        return await this._makeRequest(
            `${SERVER_URL}/shops/access/?shop_id=${shopId}`,
            {method: 'GET'}
        )
    }

    static async grant_access(userId, shopId) {
        return await this._makeRequest(
            `${SERVER_URL}/shops/access/`,
            {
                method: 'POST',
                json: {
                    user_id: userId,
                    shop_id: shopId
                }
            }
        )
    }

    static async delete_access(userId, shopId) {
        let formData = new FormData();

        return await this._makeRequest(
            `${SERVER_URL}/shops/access/`,
            {
                method: 'DELETE',
                json: {
                    user_id: userId,
                    shop_id: shopId
                }
            }
        )
    }

    static async get_self_access() {
        return await this._makeRequest(
            `${SERVER_URL}/shops/access/self`,
            {method: 'GET'}
        )
    }

    static async get_items() {
        return await this._makeRequest(
            `${SERVER_URL}/items/`,
            {method: 'GET'}
        )
    }

    static async create_item(name) {
        let formData = new FormData();
        formData.append('name', name);

        return await this._makeRequest(
            `${SERVER_URL}/items/`,
            {
                method: 'POST',
                body: formData
            }
        )
    }

    static async delete_item(itemId) {
        let formData = new FormData();
        formData.append('item_id', itemId);

        return await this._makeRequest(
            `${SERVER_URL}/items/`,
            {
                method: 'DELETE',
                body: formData
            }
        )
    }

    static async get_solds(offset, limit) {
        return await this._makeRequest(
            `${SERVER_URL}/items/sold?offset=${offset}&limit=${limit}`,
            {method: 'GET'}
        )
    }

    static async add_shop_item(shopId, itemId, price, quantity, purchasePrice) {
        let formData = new FormData();
        formData.append('item_id', itemId);
        formData.append('price', price);
        formData.append('quantity', quantity);
        formData.append('purchase_price', purchasePrice);

        return await this._makeRequest(
            `${SERVER_URL}/items/shop/?shop_id=${shopId}`,
            {
                method: 'POST',
                body: formData
            }
        )
    }

    static async get_shop_items(shopId) {
        return await this._makeRequest(
            `${SERVER_URL}/items/shop/?shop_id=${shopId}`,
            {method: 'GET'}
        )
    }

    static async delete_shop_item(shopId, itemId) {
        let formData = new FormData();
        formData.append('item_id', itemId);

        return await this._makeRequest(
            `${SERVER_URL}/items/shop/?shop_id=${shopId}`,
            {
                method: 'DELETE',
                body: formData
            }
        )
    }

    static async add_shop_queue(shopId, itemId, price, quantity, purchasePrice) {
        let formData = new FormData();
        formData.append('item_id', itemId);
        formData.append('price', price);
        formData.append('quantity', quantity);
        formData.append('purchase_price', purchasePrice);

        return await this._makeRequest(
            `${SERVER_URL}/items/shop/queue?shop_id=${shopId}`,
            {
                method: 'POST',
                body: formData
            }
        )
    }

    static async add_cart_item(shopId, itemId, quantity) {
        let formData = new FormData();
        formData.append('item_id', itemId);
        formData.append('quantity', quantity);

        return await this._makeRequest(
            `${SERVER_URL}/items/cart/?shop_id=${shopId}`,
            {
                method: 'POST',
                body: formData
            }
        )
    }

    static async get_cart_items(shopId) {
        return await this._makeRequest(
            `${SERVER_URL}/items/cart/?shop_id=${shopId}`,
            {method: 'GET'}
        )
    }

    static async del_cart_item(shopId, itemId, quantity) {
        let formData = new FormData();
        formData.append('item_id', itemId);
        formData.append('quantity', quantity);

        return await this._makeRequest(
            `${SERVER_URL}/items/cart/?shop_id=${shopId}`,
            {
                method: 'DELETE',
                body: formData
            }
        )
    }

    static async clear_cart(shopId) {
        return await this._makeRequest(
            `${SERVER_URL}/items/cart/all?shop_id=${shopId}`,
            {method: 'DELETE'}
        )
    }

    static async confirm_cart(shopId) {
        return await this._makeRequest(
            `${SERVER_URL}/items/cart/confirm?shop_id=${shopId}`,
            {method: 'POST'}
        )
    }

    static async get_users(userIds) {
        return await this._makeRequest(
            `${SERVER_URL}/users/get`,
            {
                method: 'POST',
                json: { user_ids: userIds }
            }
        )
    }

    static async get_all_users() {
        return this.get_users([])
    }

}

export default RestAPI;
