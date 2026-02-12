import { Block, BlockHeader} from "../Block"
import { Input } from "../Input"
import { Button } from "../Button"


const CreateShop = () => {
    return (
        <div className="create-shop">
            <Block>
                <BlockHeader>Добавить магазин</BlockHeader>
                <Input
                    maxLength={32}
                    placeholder={"Название магазина"}
                ></Input>
                <Input
                    maxLength={64}
                    placeholder={"Адрес"}
                ></Input>
                <Button>Добавить</Button>
            </Block>
        </div>
    )
}


export default CreateShop
