import { useContext, useRef } from "react"

import { Block, BlockHeader} from "../Block"
import { Input } from "../Input"
import { Button } from "../Button"
import AppContext from "../../AppContext"
import RestAPI from "../../../RestAPI"


const CreateShop = ({ initShops }) => {
    const {
        addNotification
    } = useContext(AppContext)

    const nameRef = useRef(null)
    const addressRef = useRef(null)

    return (
        <div id="create-shop">
        <div className="create-shop">
            <Block>
                <BlockHeader>Добавить магазин</BlockHeader>
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
            </Block>
        </div>
        </div>
    )
}


export default CreateShop
