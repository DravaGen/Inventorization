import { useCallback, useEffect, useState } from "react"

import Shop from "../Shop/Shop"
import CreateShop from "../CreateShop"
import RestAPI, { UserStatus, checkUserMinStatus } from "../../../RestAPI"


const Shops = () => {

    const [shops, setShops] = useState([])

    const initShops = useCallback(async () => {
        const [ok, response] = await RestAPI.get_shops()
        ok && setShops(response)
    }, [setShops])

    useEffect(() => {
        async function fetchData() {
            await initShops()
        }
        fetchData()
    }, [initShops])


    let shops_elements = shops.map(
        (shop) => <Shop key={shop.id} shop_id={shop.id} {...shop}/>
    )
    if (checkUserMinStatus(UserStatus.OWNER)) {
        shops_elements.push(<CreateShop initShops={initShops} key={"add-shop"} />)
    }

    return <div className="shops">{shops_elements}</div>
}


export default Shops
