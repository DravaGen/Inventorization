import { useCallback, useContext, useRef, useState } from "react"

import AddConstructor from "./AddConstructor"
import { InputValidator } from "../Input"
import { Button } from "../Button"
import { InlineGroup } from "../InlineGroup"
import RestAPI from "../../../RestAPI"
import AppContext from "../../AppContext"


const AddItem = ({ getAllItems }) => {

    const {
        addNotification
    } = useContext(AppContext)

    const inputRef = useRef(null)
    const [form, setForm] = useState({
        name: false
    })


    const logicAddItem = useCallback(async () => {
        const [ok, ] = await RestAPI.createItem(form.name)
        if (ok) {
            await getAllItems()
            inputRef.current.clear()
            addNotification("Товар создан")
        }
    }, [form, inputRef, getAllItems, addNotification])

    return (
        <AddConstructor
            idName={"add-item"}
            blockName={"Создать товар"}
        >
            <InlineGroup>
                <InputValidator
                    ref={inputRef}
                    maxLength={50}
                    updateForm={() => [setForm, "name"]}
                    placeholder="Название товара"
                />
                <Button
                    disabled={!Object.values(form).every(Boolean)}
                    onClick={logicAddItem}
                >Добавить</Button>
            </InlineGroup>
        </AddConstructor>
    )
}


export default AddItem
