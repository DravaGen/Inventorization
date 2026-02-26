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

function checkUserMinStatus(minStatus) {
    if (weightsUserStatus[localStorage?.status] < weightsUserStatus[minStatus]) {
        return false
    }
    return true
}


class RestAPI {

    static _addNotif = (message, type) => {}  // eslint-disable-line no-unused-vars
    static _oldNotifMessage = null
    static _sendNotifDatetime = null

    static _logouting = () => {}

    static setAddNotif(fn) {
        this._addNotif = fn
    }

    static setLogouting(fn) {
        this._logouting = fn
    }

    static sendNotif(message, type) {
        if (
            this._oldNotifMessage == message
            && this._sendNotifDatetime + 8000 > new Date().getTime()
        ) return

        this._addNotif(message, type)
        this._oldNotifMessage = message
        this._sendNotifDatetime = new Date().getTime()
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

            this.sendNotif(message, "error")
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

    static async getShops() {
        return await this._makeRequest(
            `${SERVER_URL}/shops/list`,
            {method: "GET"}
        )
    }

    static async signupUser(email, status) {
        return await this._makeRequest(
            `${SERVER_URL}/users/`,
            {
                method: 'POST',
                json: {email, status}
            }
        )
    }

    static async updateUser(email, status) {
        return await this._makeRequest(
            `${SERVER_URL}/users/?email=${email}`,
            {
                method: 'PATCH',
                json: {status}
            }
        )
    }

    static async createShop(name, address) {
        return await this._makeRequest(
            `${SERVER_URL}/shops/`,
            {
                method: 'POST',
                json: {name, address}
            }
        )
    }

    static async getAccess(shopId) {
        return await this._makeRequest(
            `${SERVER_URL}/shops/access/?shop_id=${shopId}`,
            {method: 'GET'}
        )
    }

    static async grantAccess(userId, shopId) {
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

    static async deleteAccess(userId, shopId) {
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

    static async getSelfAccess() {
        return await this._makeRequest(
            `${SERVER_URL}/shops/access/self`,
            {method: 'GET'}
        )
    }

    static async getItems() {
        return await this._makeRequest(
            `${SERVER_URL}/items/`,
            {method: 'GET'}
        )
    }

    static async createItem(name) {
        return await this._makeRequest(
            `${SERVER_URL}/items/`,
            {
                method: 'POST',
                json: {name}
            }
        )
    }

    static async deleteItem(itemId) {
        return await this._makeRequest(
            `${SERVER_URL}/items/`,
            {
                method: 'DELETE',
                json: {item_id: itemId}
            }
        )
    }

    static async getSolds(offset, limit) {
        return await this._makeRequest(
            `${SERVER_URL}/items/sold?offset=${offset}&limit=${limit}`,
            {method: 'GET'}
        )
    }

    static async addShopItem(shopId, itemId, price, quantity, purchasePrice) {
        return await this._makeRequest(
            `${SERVER_URL}/items/shop/?shop_id=${shopId}`,
            {
                method: 'POST',
                json: {
                    shop_id: shopId,
                    item_id: itemId,
                    price, quantity,
                    purchase_price: purchasePrice
                }
            }
        )
    }

    static async getShopItems(shopId) {
        return await this._makeRequest(
            `${SERVER_URL}/items/shop/?shop_id=${shopId}`,
            {method: 'GET'}
        )
    }

    static async deleteShopItem(shopId, itemId) {
        return await this._makeRequest(
            `${SERVER_URL}/items/shop/?shop_id=${shopId}`,
            {
                method: 'DELETE',
                json: {item_id: itemId}
            }
        )
    }

    static async addShopQueue(shopId, itemId, price, quantity, purchasePrice) {
        return await this._makeRequest(
            `${SERVER_URL}/items/shop/queue?shop_id=${shopId}`,
            {
                method: 'POST',
                json: {
                    item_id: itemId,
                    price, quantity,
                    purchase_price: purchasePrice
                }
            }
        )
    }

    static async addCartItem(shopId, itemId, quantity) {
        return await this._makeRequest(
            `${SERVER_URL}/items/cart/?shop_id=${shopId}`,
            {
                method: 'POST',
                json: {item_id: itemId, quantity}
            }
        )
    }

    static async getCartItems(shopId) {
        return await this._makeRequest(
            `${SERVER_URL}/items/cart/?shop_id=${shopId}`,
            {method: 'GET'}
        )
    }

    static async delCartItem(shopId, itemId, quantity) {
        return await this._makeRequest(
            `${SERVER_URL}/items/cart/?shop_id=${shopId}`,
            {
                method: 'DELETE',
                json: {item_id: itemId, quantity}
            }
        )
    }

    static async clearCart(shopId) {
        return await this._makeRequest(
            `${SERVER_URL}/items/cart/all?shop_id=${shopId}`,
            {method: 'DELETE'}
        )
    }

    static async confirmCart(shopId) {
        return await this._makeRequest(
            `${SERVER_URL}/items/cart/confirm?shop_id=${shopId}`,
            {method: 'POST'}
        )
    }

    static async getUsers(userIds) {
        return await this._makeRequest(
            `${SERVER_URL}/users/get`,
            {
                method: 'POST',
                json: { user_ids: userIds }
            }
        )
    }

    static async getAllUsers() {
        return this.getUsers([])
    }

}


export { UserStatus, checkUserMinStatus };
export default RestAPI;
