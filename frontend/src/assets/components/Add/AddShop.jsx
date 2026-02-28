import { useCallback, useContext, useRef, useState } from "react"

import AddConstructor from "./AddConstructor"
import { InputValidator } from "../Input"
import { Button } from "../Button"
import AppContext from "../../AppContext"
import RestAPI from "../../../RestAPI"


const AddShop = ({ initShops }) => {
    const {
        addNotification
    } = useContext(AppContext)

    const nameRef = useRef()
    const addressRef = useRef()

    const [form, setForm] = useState({
        name: false,
        address: false
    })

    const logicAddShop = useCallback(async () => {
        const [ok, ] = await RestAPI.createShop(form.name, form.address)
        if (ok) {
            initShops()
            addNotification(`Магазин создан`)
            nameRef.current.clear()
            addressRef.current.clear()
        }
    }, [
        form, nameRef, addressRef,
        initShops, addNotification
    ])

    return (
        <div>
            <AddConstructor
                idName={"add-shop"}
                blockName={"Добавить магазин"}
                addStyle={false}
            >
                <InputValidator
                    ref={nameRef}
                    maxLength={32}
                    updateForm={() => [setForm, "name"]}
                    placeholder={"Название магазина"}
                />
                <InputValidator
                    ref={addressRef}
                    maxLength={64}
                    updateForm={() => [setForm, "address"]}
                    placeholder={"Адрес"}
                />
                <Button
                    disabled={!Object.values(form).every(Boolean)}
                    onClick={logicAddShop}
                >Добавить</Button>
            </AddConstructor>
        </div>
    )
}


export default AddShop
