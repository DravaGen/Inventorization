import { useContext, useEffect, useState } from "react"
import "./index.css"
import Shop from "../Shop/Shop"
import CreateShop from "../CreateShop/CreateShop"
import AppContext from "../../AppContext"
import RestAPI from "../../../RestAPI"


const Shops = () => {

    const [shops, setShops] = useState([])

    useEffect(() => {
        async function initShops() {
            const [ok, response] = await RestAPI.get_shops()
            ok && setShops(response)
        }
        initShops()
    }, [])


    let shops_elements = shops.map(
        (shop) => <Shop key={shop.id} shop_id={shop.id} {...shop}/>
    )
    shops_elements.push(<CreateShop key={"add-shop"} />)

    return <div className="shops">{shops_elements}</div>
}

export default Shops
