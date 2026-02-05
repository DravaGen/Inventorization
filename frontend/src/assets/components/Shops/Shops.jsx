import { useContext, useEffect, useState } from "react"
import "./index.css"
import Shop from "../Shop/Shop"
import RestAPI from "../../../RestAPI"
import NotificationsContext from "../Notifications/NotificationsContext"

const Shops = () => {

    const [shops, setShops] = useState([])
    const {
        addNotification
    } = useContext(NotificationsContext)

    useEffect(() => {
        async function initShops() {
            const response = await RestAPI.get_shops()
            if (response.ok) {
                setShops(response.data)
            } else {
                addNotification(response.message, response.type)
            }
        }
        initShops()
    }, [])

    return (
        <div className="shops">
            {shops.map((shop) => <Shop key={shop.id} {...shop}></Shop>)}
        </div>
    )
}

export default Shops
