import { useCallback, useContext, useRef, useState } from "react"

import ManagerItem from "./ManagerItem"
import { SelectUserStatus } from "../Select"
import { Button } from "../Button"
import RestAPI, { UserStatus } from "../../../RestAPI"
import AppContext from "../../AppContext"


const ManagerItemUser = ({ user, updateSelected }) => {

    const {
        addNotification
    } = useContext(AppContext)

    const managerRef = useRef(null)
    const [status, setStatus] = useState(user.status)
    const [localStatus, setLocalStatus] = useState(user.status)


    const getHeaderIndicator = useCallback((user) => {
        switch (user.status) {
            case UserStatus.WORKER:
                return "green"
            case UserStatus.BANNED:
                return "red"
            default:
                return "yellow"
        }
    }, [])
    const [headerIndicator, setHeaderIndicator] = useState(getHeaderIndicator(user))

    const selectElement = <SelectUserStatus
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        small={true}
    />

    const updateUser = useCallback(async () => {
        const row = managerRef.current
        const email = row.querySelector('.manager-item-header').textContent
        const [ok, ] = await RestAPI.updateUser(email, status)
        if (ok) {
            setStatus(status)
            setLocalStatus(status)
            setHeaderIndicator(getHeaderIndicator({status}))
            addNotification(`${email} получил новый статус`)
        }
    }, [managerRef, status, addNotification, getHeaderIndicator])

    const updateButton = <Button
        disabled={localStatus == status}
        onClick={async () => updateUser()}
    >Изменить</Button>

    return (
        <ManagerItem
            title={user.email}
            ref={managerRef}
            headerIndicator={headerIndicator}
            updateSelected={updateSelected}
        >
            <div>id: {user.id}</div>
            <div className="line">Статус: {selectElement}</div>
            {updateButton}
        </ManagerItem>
    )
}


export default ManagerItemUser
