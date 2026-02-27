import { useCallback, useEffect, useState } from "react"

import Shop from "../Shop/Shop"
import { AddShop } from "../Add"
import RestAPI, { UserStatus, checkUserMinStatus } from "../../../RestAPI"


const Shops = () => {

    const [shops, setShops] = useState([])

    const initShops = useCallback(async () => {
        const [ok, response] = await RestAPI.getShops()
        ok && setShops(response)
    }, [setShops])

    useEffect(() => {
        async function fetchData() {
            await initShops()
        }
        fetchData()
    }, [initShops])


    let shopsElements = shops.map(
        (shop) => <Shop key={shop.id} shopId={shop.id} {...shop}/>
    )
    if (checkUserMinStatus(UserStatus.OWNER)) {
        shopsElements.push(<AddShop initShops={initShops} key={"add-shop"} />)
    }

    return <div className="shops">{shopsElements}</div>
}


export default Shops
