import { useRef, useContext } from "react"

import AddConstructor from "./AddConstructor"
import { Input } from "../Input"
import { Button } from "../Button"
import { InlineGroup } from "../InlineGroup"
import AppContext from "../../AppContext"
import RestAPI, { UserStatus } from "../../../RestAPI"


const AddUser = ({ initBlocksData }) => {

    const {
        addNotification
    } = useContext(AppContext)

    const emailRef = useRef(null)

    return (
        <AddConstructor
            idName={"add-user"}
            blockName={"Добавить работника"}
        >
            <InlineGroup>
                <Input
                    id="email"
                    maxLength={100}
                    placeholder="email нового работника"
                    ref={emailRef}
                />
                <Button
                    onClick={async () => {
                        const email = emailRef.current.value.trim()
                        const status = UserStatus.BANNED

                        if (!email) {
                            addNotification("Адрес электронной почты не может быть пустым", "warning")
                            return
                        }

                        if (!(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email))) {
                            addNotification("Неверный формат электронной почты", "warning")
                            return
                        }

                        const [ok, ] = await RestAPI.signupUser(email, status)
                        if (ok) {
                            initBlocksData()
                            addNotification(`Пользователь ${email} создан`)
                            emailRef.current.value = ""
                        }
                    }}
                >Добавить</Button>
            </InlineGroup>
        </AddConstructor>
    )
}


export default AddUser
