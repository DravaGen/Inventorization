import { useRef, useContext, useState, useCallback } from "react"

import AddConstructor from "./AddConstructor"
import { InputEmail } from "../Input"
import { Button } from "../Button"
import { InlineGroup } from "../InlineGroup"
import AppContext from "../../AppContext"
import RestAPI, { UserStatus } from "../../../RestAPI"


const AddUser = ({ initBlocksData }) => {

    const {
        addNotification
    } = useContext(AppContext)

    const emailRef = useRef()
    const [form, setForm] = useState({
        email: false
    })

    const logicAddUser = useCallback(async () => {
        const [ok, ] = await RestAPI.signupUser(form.email, UserStatus.BANNED)
        if (ok) {
            initBlocksData()
            emailRef.current.clear()
            addNotification(`Пользователь ${form.email} создан`)
        }
    }, [form, emailRef, initBlocksData, addNotification])

    return (
        <AddConstructor
            idName={"add-user"}
            blockName={"Добавить работника"}
        >
            <InlineGroup>
                <InputEmail
                    ref={emailRef}
                    updateForm={() => [setForm, "email"]}
                    placeholder="email нового работника"
                />
                <Button
                    disabled={!Object.values(form).every(Boolean)}
                    onClick={logicAddUser}
                >Добавить</Button>
            </InlineGroup>
        </AddConstructor>
    )
}


export default AddUser
