import { useEffect } from "react"
import Button from "./Button"


const Notification = ({data, deleteNotif}) => {

    useEffect(() => {
        const timeout = setTimeout(() => deleteNotif(data.id), 5000)
        return () => clearTimeout(timeout)
    }, [data.id])

    return (
        <div className={`notification ${data.type}`}>
            <div className="notification-content">{data.text}</div>
            <Button
                className={`notification-close ${data.type}`}
                onClick={() => deleteNotif(data.id)}
            >Скрыть</Button>
        </div>
    )
}


const Notifications = ({notifications, deleteNotif}) => {

    return (
        <div id="notifications">
            {notifications.map(
                (data) => <Notification
                    key={data.id}
                    data={data}
                    deleteNotif={deleteNotif}
                />
            )}
        </div>
    )
}

export default Notifications
