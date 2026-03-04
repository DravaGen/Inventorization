import { useState, useCallback, useRef } from "react"

import ManagerItem from "./ManagerItem"
import { InputNumber, isUnsignedIntegerPositive } from "../Input"
import { Button } from "../Button"
import RestAPI from "../../../RestAPI"


const ManagerItemCartItem = ({
    item,
    shop_id,
    getItemsInCart,
    ...props
}) => {

    const [form, setForm] = useState({
        quantity: item.quantity
    })
    const quantityRef = useRef()

    const logicIncrementQuantity = useCallback(async () => {
        const [ok, response] = await RestAPI.addCartItem(shop_id, item.id, 1)
        if (ok) {
            quantityRef.current.value = response.item.quantity.toString()
            getItemsInCart()
        }
    }, [shop_id, item, getItemsInCart])

    const logicDecrementQuantity = useCallback(async () => {
        const [ok, response] = await RestAPI.delCartItem(shop_id, item.id, 1)
        if (ok) {
            if (response.item) {
                quantityRef.current.value = response.item.quantity.toString()
            }
            getItemsInCart()
        }
    }, [shop_id, item, getItemsInCart])

    const customTitle = <div className="control-item-header">
        <div className="name-item">{item.name}</div>
        <div className="control-item-block">
            <Button onClick={logicIncrementQuantity}>+</Button>
            <InputNumber
                ref={quantityRef}
                defaultValue={form.quantity}
                updateForm={() => [setForm, "quantity"]}
                condition={async (e) => {
                    const isInt = isUnsignedIntegerPositive(e)
                    if (!isInt) return false

                    const ok = await RestAPI.updateCartItemQuantity(
                        shop_id, item.id, +e
                    )
                    if (!ok) return false

                    return true
                }}
            />
            <Button onClick={logicDecrementQuantity}>-</Button>
        </div>
    </div>

    return (
        <ManagerItem
            title={customTitle}
            {...props}
        >
            <div>id: {item.id}</div>
        </ManagerItem>
    )
}


export default ManagerItemCartItem
