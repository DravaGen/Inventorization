import { useContext, useRef } from "react"

import AddConstructor from "./AddConstructor"
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
        <AddConstructor
            idName={"add-item"}
            blockName={"Создать товар"}
        >
            <InlineGroup>
                <Input
                    id="name"
                    ref={inputRef}
                    maxLength={50}
                    placeholder="Название товара"
                />
                <Button
                    onClick={async () => {
                        const [ok, ] = await RestAPI.createItem(
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
        </AddConstructor>
    )
}


export default AddItem
