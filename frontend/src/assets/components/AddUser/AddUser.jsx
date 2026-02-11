import Input from "../Input/Input"
import Button from "../Button/Button"
import InlineGroup from "../InlineGroup/InlineGroup"
import "./index.css"

const AddUser = () => {
    return (
        <div id="add-user">
            <label htmlFor="email">Добавить работника</label>

            <InlineGroup>
                <Input
                    id="email"
                    maxLength={32}
                    placeholder="email нового работника"
                />
                <Button>Добавить</Button>
            </InlineGroup>
        </div>
    )
}

export default AddUser
