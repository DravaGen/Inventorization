import { useCallback, useEffect, useState } from "react"

import Shop from "./Shop"
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
        (shop) => <Shop key={shop.id} {...shop} initShops={initShops}/>
    )
    if (checkUserMinStatus(UserStatus.OWNER)) {
        shopsElements.push(<AddShop key={"add-shop"} initShops={initShops}/>)
    }

    return <div className="shops">{shopsElements}</div>
}


export default Shops
