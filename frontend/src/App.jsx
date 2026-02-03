import { useState } from "react"

import "./App.css"
import LoginBlock from "./assets/components/LoginBlock"
import Natifications from "./assets/components/Notifications/Natifications"
import NotificationsContext from "./assets/components/Notifications/NotificationsContext"

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

        <NotificationsContext.Provider value={{
            notifications,
            deleteNotification,
            addNotification
        }}>
            <Natifications />
            <LoginBlock />
        </NotificationsContext.Provider>
    )
}

export default App
