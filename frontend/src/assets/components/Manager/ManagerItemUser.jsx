import { useCallback, useContext, useRef, useState } from "react"

import ManagerItem from "./ManagerItem"
import { SelectUserStatus } from "../Select"
import { Button } from "../Button"
import RestAPI from "../../../RestAPI"
import AppContext from "../../AppContext"


const ManagerItemUser = ({ user }) => {

    const {
        addNotification
    } = useContext(AppContext)

    const managerRef = useRef(null)
    const [status, setStatus] = useState(user.status)

    const selectElement = <SelectUserStatus
        value={status}
        onChange={(e) => setStatus(e.target.value)}
    />

    const updateUser = useCallback(async () => {
        const row = managerRef.current
        const email = row.querySelector('.manager-item-header').textContent
        const [ok, ] = await RestAPI.update_user(email, status)
        if (ok) {
            addNotification(`${email} получил новый статус`)
            user.status = status
            setStatus(status)
        }
    }, [status])

    const updateButton = <Button
        disabled={user.status == status}
        onClick={async () => updateUser()}
    >Изменить</Button>


    return (
        <ManagerItem title={user.email} ref={managerRef}>
            <div>id: {user.id}</div>
            <div>Статус: {selectElement}</div>
            {updateButton}
        </ManagerItem>
    )
}


export default ManagerItemUser
