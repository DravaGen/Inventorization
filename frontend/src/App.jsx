import { useState, useCallback } from "react"

import "./App.css"
import LoginBlock from "./assets/components/Login/LoginBlock"
import Notifications from "./assets/components/Notifications/Notifications"
import NotificationsContext from "./assets/components/Notifications/NotificationsContext"

const App = () => {

    const [notifications, setNotifications] = useState([])

    const addNotification = useCallback((text, type="info") => {
        if (!text) return
        setNotifications(prev => [...prev, {
            id: crypto.randomUUID(),
            text: text,
            type: type
        }])
    })

    const deleteNotification = useCallback((id) => {
        setNotifications(prev =>
            prev.filter(notification => notification.id !== id)
        )
    })

    return (

        <NotificationsContext.Provider value={{
            notifications,
            deleteNotification,
            addNotification
        }}>
            <Notifications />
            <LoginBlock />
        </NotificationsContext.Provider>
    )
}

export default App
