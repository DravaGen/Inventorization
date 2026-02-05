import Block from "../Block/Block"
import BlockHeader from "../Block/BlockHeader"
import Input from "../Input/Input"
import Button from "../Button/Button"


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
