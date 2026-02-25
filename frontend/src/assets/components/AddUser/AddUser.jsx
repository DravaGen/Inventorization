import { useRef, useContext } from "react"
import { Input } from "../Input"
import { Button } from "../Button"
import { SelectUserStatus } from "../Select"
import { InlineGroup } from "../InlineGroup"
import AppContext from "../../AppContext"
import RestAPI from "../../../RestAPI"


const AddUser = ({ initBlocksData }) => {

    const {
        addNotification
    } = useContext(AppContext)

    const emailRef = useRef(null)
    const statusRef = useRef(null)

    return (
        <div id="add-user">
            <div className="block-name">Добавить работника</div>

            <InlineGroup>
                <Input
                    id="email"
                    maxLength={100}
                    placeholder="email нового работника"
                    ref={emailRef}
                />
                <SelectUserStatus ref={statusRef} visibleCount={2} />
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
