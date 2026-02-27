import { useCallback, useContext, useRef, useState} from "react"

import AddConstructor from "./AddConstructor"
import { InputNumber, isUnsignedInteger } from "../Input"
import { Select, SelectOption } from "../Select"
import { Button } from "../Button"
import { InlineGroup } from "../InlineGroup"
import RestAPI from "../../../RestAPI"
import AppContext from "../../AppContext"


const AddShopItem = ({ shop_id, items, getItemsInShop }) => {

    const {
        addNotification
    } = useContext(AppContext)

    const [form, setForm] = useState({
        itemId: false,
        price: false,
        quantity: false,
        purchasePrice: false,
    })

    const logicAddItemShop = useCallback(async () => {
        const {itemId, price, quantity, purchasePrice} = form
        const [ok, ] = await RestAPI.addShopItem(
            shop_id, itemId, price, quantity, purchasePrice
        )
        if (ok) {
            getItemsInShop()
            addNotification("Товар добавлен в магазин")
        }
    }, [form, getItemsInShop, addNotification])


    return (
        <AddConstructor
            idName={"add-shop-item"}
            blockName={"Добавить товар"}
        >
            <InlineGroup>
                <Select
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
                type="number"
                placeholder="Количество"
                condition={isUnsignedInteger}
                updateForm={() => [setForm, "quantity"]}
            />
            <InlineGroup>
                <InputNumber
                    type="number"
                    placeholder="Цена продажи"
                    condition={isUnsignedInteger}
                    updateForm={() => [setForm, "price"]}
                />
                <InputNumber
                    type="number"
                    placeholder="Цена закупки"
                    condition={isUnsignedInteger}
                    updateForm={() => [setForm, "purchasePrice"]}
                />
            </InlineGroup>
            <Button
                disabled={!Object.values(form).every(Boolean)}
                onClick={logicAddItemShop}
            >Добавить</Button>
        </AddConstructor>
    )
}


export default AddShopItem
