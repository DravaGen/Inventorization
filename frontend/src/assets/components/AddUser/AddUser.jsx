import { useRef, useContext } from "react"
import Input from "../Input/Input"
import Button from "../Button/Button"
import SelectUserStatus from "../Select/SelectUserStatus"
import InlineGroup from "../InlineGroup/InlineGroup"
import AppContext from "../../AppContext"
import RestAPI from "../../../RestAPI"
import "./index.css"

const AddUser = ({ initBlocksData }) => {

    const {
        addNotification
    } = useContext(AppContext)

    const emailRef = useRef(null)
    const statusRef = useRef(null)

    return (
        <div id="add-user">
            <label htmlFor="email">Добавить работника</label>

            <InlineGroup>
                <Input
                    id="email"
                    maxLength={100}
                    placeholder="email нового работника"
                    ref={emailRef}
                />
                <SelectUserStatus ref={statusRef} />
                <Button
                    onClick={async () => {
                        const email = emailRef.current.value.trim()
                        const status = statusRef.current.value

                        if (!email) {
                            addNotification("Адрес электронной почты не может быть пустым", "warning")
                            return
                        }

                        if (!(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email))) {
                            addNotification("Неверный формат электронной почты", "warning")
                            return
                        }

                        const [ok, ] = await RestAPI.signup_user(email, status)
                        if (ok) {
                            initBlocksData()
                            addNotification(`Пользователь ${email} создан`)
                            emailRef.current.value = ""
                        }
                    }}
                >Добавить</Button>
            </InlineGroup>
        </div>
    )
}

export default AddUser
