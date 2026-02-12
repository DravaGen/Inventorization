import { useEffect, useContext } from "react"

import { Button } from "../Button"
import AppContext from "../../AppContext"


const Notification = ({data}) => {

    const {
        deleteNotification
    } = useContext(AppContext)

    useEffect(() => {
        const timeout = setTimeout(() => deleteNotification(data.id), 12000)
        return () => clearTimeout(timeout)
    }, [data.id])

    return (
        <div className={`notification ${data.type}`}>
            <div className="notification-content">{data.text}</div>
            <Button
                className={`notification-close ${data.type}`}
                onClick={() => deleteNotification(data.id)}
            >Скрыть</Button>
        </div>
    )
}


const Notifications = () => {

    const {
        notifications
    } = useContext(AppContext)

    return (
        <div id="notifications">
            {notifications.map(
                (data) => <Notification
                    key={data.id}
                    data={data}
                />
            )}
        </div>
    )
}


export default Notifications
