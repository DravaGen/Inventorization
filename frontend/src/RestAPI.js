const SERVER_URL = "http://localhost:8000"

const UserStatus = Object.freeze({
    BANNED: "banned",
    WORKER: "worker",
    ADMIN: "admin",
    OWNER: "owner",
});

const weightsUserStatus = {
    [UserStatus.BANNED]: 0,
    [UserStatus.WORKER]: 50,
    [UserStatus.ADMIN]: 80,
    [UserStatus.OWNER]: 100,
};


class RestAPI {

    static _add_notif = (message, type) => {}
    static _old_notif_message = null
    static _send_notif_datetime = null

    static _logouting = () => {}

    static set_add_notif(fn) {
        this._add_notif = fn
    }

    static set_logouting(fn) {
        this._logouting = fn
    }

    static send_notif(message, type) {
        if (
            this._old_notif_message == message
            && this._send_notif_datetime + 8000 > new Date().getTime()
        ) return

        this._add_notif(message, type)
        this._old_notif_message = message
        this._send_notif_datetime = new Date().getTime()
    }

    static async handleError(error) {
        const body = await error.text();
        const data = body ? JSON.parse(body) : null

        if (
            error.status == 403 &&
            data && data?.detail == "user is banned"
        ) {
            localStorage.setItem("status", UserStatus.BANNED)
            this._logouting()
        }

        if (error.status === 500) {
            // Internal server error
            return {detail: "Internal Server Error"};
        } else if (data) {
            // Server returned error description
            return data;
        } else {
            // Unknown errors
            return error;
        }
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

        let ok = false
        let data = undefined

        await fetch(url, args)
            .then(async (response) => {
                if (response.ok) {
                    ok = true
                    data = await response.json()
                } else {
                    data = await this.handleError(response)
                }
            })
            .catch(() => {
                data = {detail: "Cant connect to server"}
            })

        if (!ok) {
            let message = JSON.stringify(data)
            const detail = data?.detail

            if (detail && typeof detail == "string") {
                message = detail
            }

            this.send_notif(message, "error")
        }

        return [ok, data]

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
        return await this._makeRequest(
            `${SERVER_URL}/users/`,
            {
                method: 'POST',
                json: {email, status}
            }
        )
    }

    static async update_user(email, status) {
        return await this._makeRequest(
            `${SERVER_URL}/users/?email=${email}`,
            {
                method: 'PATCH',
                json: {status}
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

export { UserStatus };
export default RestAPI;
