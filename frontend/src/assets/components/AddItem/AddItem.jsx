import { useContext, useRef } from "react"
import { Input } from "../Input"
import { Button } from "../Button"
import { InlineGroup } from "../InlineGroup"
import RestAPI from "../../../RestAPI"
import AppContext from "../../AppContext"


const AddItem = ({ getAllItems }) => {

    const inputRef = useRef(null)
    const {
        addNotification
    } = useContext(AppContext)

    return (
        <div id="add-item">
            <div className="block-name">Создать товар</div>

            <InlineGroup>
                <Input
                    id="name"
                    ref={inputRef}
                    maxLength={50}
                    placeholder="Название товара"
                />
                <Button
                    onClick={async () => {
                        const [ok, ] = await RestAPI.create_item(
                            inputRef.current.value.trim()
                        )
                        if (ok) {
                            await getAllItems()
                            inputRef.current.value = ""
                            addNotification("Товар создан")
                        }
                    }}
                >Добавить</Button>
            </InlineGroup>
        </div>
    )
}


export default AddItem
