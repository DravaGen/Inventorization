import { Input } from "../Input"
import { Button } from "../Button"
import { InlineGroup } from "../InlineGroup"


const AddItem = () => {
    return (
        <div id="add-item">
            <label htmlFor="name">Создать товар</label>

            <InlineGroup>
                <Input
                    id="name"
                    maxLength={50}
                    placeholder="Название товара"
                />
                <Button>Добавить</Button>
            </InlineGroup>
        </div>
    )
}


export default AddItem
