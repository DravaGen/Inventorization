import { useCallback, useRef, useState } from "react"

import AddConstructor from "./AddConstructor"
import { Button } from "../Button"
import { InlineGroup } from "../InlineGroup"
import { InputNumber, isUnsignedIntegerPositive } from "../Input"
import { Select, SelectOption } from "../Select"
import RestAPI from "../../../RestAPI"


const AddCartItem = ({ items, shop_id, getItemsInCart }) => {

    const [form, setForm] = useState({
        itemId: false,
        quantity: 1
    })

    const itemRef = useRef()
    const quantityRef = useRef()

    const logicAddCartItem = useCallback(async () => {
        await RestAPI.addCartItem(shop_id, form.itemId, form.quantity)
        itemRef.current.clear()
        quantityRef.current.value = "1";
        setForm({itemId: false, quantity: 1})
        getItemsInCart()
    }, [
        shop_id, form, getItemsInCart,
        itemRef, quantityRef, setForm
    ])


    return (
        <AddConstructor
            blockName={"Добавить в корзину"}
        >
            <InlineGroup>
                <Select
                    ref={itemRef}
                    searchInput={true}
                    visibleCount={4}
                    updateForm={() => [setForm, "itemId"]}
                >{items.map((item) => (
                    <SelectOption
                        key={item.id}
                        value={item.id}
                    >{item.name}</SelectOption>
                ))}</Select>
            </InlineGroup>
            <InputNumber
                ref={quantityRef}
                type={"number"}
                placeholder={"Количество"}
                condition={isUnsignedIntegerPositive}
                updateForm={() => [setForm, "quantity"]}
                defaultValue={"1"}
            />
            <Button
                disabled={!Object.values(form).every(Boolean)}
                onClick={logicAddCartItem}
            >Добавить</Button>

        </AddConstructor>
    )
}


export default AddCartItem
