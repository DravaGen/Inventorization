import { useEffect, useContext } from "react"

import "./index.css"
import Button from "../Button/Button"
import NotificationsContext from "./NotificationsContext"


const Notification = ({data}) => {

    const {
        deleteNotification
    } = useContext(NotificationsContext)

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
    } = useContext(NotificationsContext)

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
