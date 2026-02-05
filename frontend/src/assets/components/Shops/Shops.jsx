import { useEffect, useState } from "react"
import "./index.css"
import Shop from "../Shop/Shop"
import RestAPI from "../../../RestAPI"


const Shops = () => {

    const [shops, setShops] = useState([])

    useEffect(() => {
        async function initShops() {
            setShops((await RestAPI.get_shops()).data)
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
