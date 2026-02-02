import { useState } from "react"

import "./App.css"
import LoginBlock from "./assets/components/LoginBlock"
import Natifications from "./assets/components/Notifications/Natifications"

const App = () => {

    const [notifications, setNotifications] = useState([])

    function addNotification(text, type="info") {
        setNotifications(prev => [...prev, {
            id: crypto.randomUUID(),
            text: text,
            type: type
        }])
    }

    function deleteNotification(id) {
        setNotifications(prev =>
            prev.filter(notification => notification.id !== id)
        )
    }

    return (
        <>
            <Natifications
                deleteNotif={deleteNotification}
                notifications={notifications}
            />
            <LoginBlock />
        </>
    )
}

export default App
