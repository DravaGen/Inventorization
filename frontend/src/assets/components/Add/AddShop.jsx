import { useContext, useRef } from "react"

import AddConstructor from "./AddConstructor"
import { Input } from "../Input"
import { Button } from "../Button"
import AppContext from "../../AppContext"
import RestAPI from "../../../RestAPI"


const AddShop = ({ initShops }) => {
    const {
        addNotification
    } = useContext(AppContext)

    const nameRef = useRef(null)
    const addressRef = useRef(null)

    return (
        <div>
            <AddConstructor
                idName={"add-shop"}
                blockName={"Добавить магазин"}
                addStyle={false}
            >
                <Input
                    ref={nameRef}
                    maxLength={32}
                    placeholder={"Название магазина"}
                ></Input>
                <Input
                    ref={addressRef}
                    maxLength={64}
                    placeholder={"Адрес"}
                ></Input>
                <Button
                    onClick={async ()=>{
                        const name = nameRef.current.value.trim()
                        const address = addressRef.current.value.trim()

                        if (!name || !address) {
                            addNotification("Данные не заполнены", "warning")
                            return
                        }

                        const [ok, ] = await RestAPI.createShop(name, address)
                        if (ok) {
                            initShops()
                            addNotification(`Магазин создан`)
                            nameRef.current.value = ""
                            addressRef.current.value = ""
                        }
                    }}
                >Добавить</Button>
            </AddConstructor>
        </div>
    )
}


export default AddShop
