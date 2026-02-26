import { useRef, useCallback, useContext} from "react"

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

    const itemRef = useRef(null)
    const quantityRef = useRef(null)
    const priceRef = useRef(null)
    const purchaseRef = useRef(null)

    const logicAddItemShop = useCallback(async () => {
        const item = itemRef.current.value
        const quantity = quantityRef.current.value
        const price = priceRef.current.value
        const purchase = purchaseRef.current.value

        if (!item || !quantity || !price || !purchase) {
            addNotification("Данные не заполнены", "warning")
            return
        }

        const [ok, ] = await RestAPI.add_shop_item(
            shop_id, item, price, quantity, purchase
        )
        if (ok) {
            getItemsInShop()
            addNotification("Товар добавлен в магазин")
        }


    }, [itemRef, quantityRef, priceRef, purchaseRef])

    return (
        <div id="add-shop-item">
            <div className="block-name">Добавить товар</div>

            <InlineGroup>
                <Select
                    ref={itemRef}
                    search_input={true}
                    visibleCount={4}
                >{items.map((item) => (
                    <SelectOption
                        key={item.id}
                        value={item.id}
                    >{item.name}</SelectOption>
                ))}</Select>
            </InlineGroup>

            <InputNumber
               ref={quantityRef}
                type="number"
                placeholder="Количество"
                condition={isUnsignedInteger}
            />
            <InlineGroup>
                <InputNumber
                    ref={priceRef}
                    type="number"
                    placeholder="Цена продажи"
                    condition={isUnsignedInteger}
                />
                <InputNumber
                    ref={purchaseRef}
                    type="number"
                    placeholder="Цена закупки"
                    condition={isUnsignedInteger}
                />
            </InlineGroup>
            <Button
                onClick={logicAddItemShop}
            >Добавить</Button>
        </div>
    )
}


export default AddShopItem
