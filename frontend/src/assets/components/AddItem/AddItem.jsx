import { Input } from "../Input"
import { Button } from "../Button"
import { InlineGroup } from "../InlineGroup"


const AddItem = () => {
    return (
        <div id="add-item">
            <div className="block-name">Создать товар</div>

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
