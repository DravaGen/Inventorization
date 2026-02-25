import { Input } from "../Input"
import { Select, SelectOption } from "../Select"
import { Button } from "../Button"
import { InlineGroup } from "../InlineGroup"


const AddShopItem = ({ items }) => {

    return (
        <div id="add-shop-item">
            <div className="block-name">Добавить товар</div>

            <InlineGroup>
                <Select search_input={true}>{items.map((item) => (
                    <SelectOption
                        key={item.id}
                        value={item.id}
                    >{item.name}</SelectOption>
                ))}</Select>
            </InlineGroup>

            <Input
                id="price"
                type="number"
                min={0}
                max={2147483647}
                placeholder="Количество"
            />
            <InlineGroup>
                <Input
                    id="quantity"
                    type="number"
                    min={0}
                    max={2147483647}
                    placeholder="Цена продажи"
                />
                <Input
                    id="purchase_price"
                    type="number"
                    min={0}
                    max={2147483647}
                    placeholder="Цена закупки"
                />
            </InlineGroup>
            <Button>Добавить</Button>
        </div>
    )
}


export default AddShopItem
