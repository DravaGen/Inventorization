import { useState, useCallback } from "react"

import "./App.css"
import Readonly from "./assets/components/Readonly/Readonly"
import LoginBlock from "./assets/components/Login/LoginBlock"
import Notifications from "./assets/components/Notifications/Notifications"
import NotificationsContext from "./assets/components/Notifications/NotificationsContext"

const App = () => {

    const [notifications, setNotifications] = useState([])
    const login = Boolean(
        localStorage?.user_id
        && localStorage?.exp > new Date().getTime() / 1000
    )

    const addNotification = useCallback((text, type="info") => {
        if (!text) return
        setNotifications(prev => [...prev, {
            id: crypto.randomUUID(),
            text: text,
            type: type
        }])
    }, [])

    const deleteNotification = useCallback((id) => {
        setNotifications(prev =>
            prev.filter(notification => notification.id !== id)
        )
    }, [])

    return (

        <NotificationsContext.Provider value={{
            notifications,
            deleteNotification,
            addNotification
        }}>
            <Notifications />
            {!login && <LoginBlock />}
            {login && <Readonly>user_id: {localStorage.user_id}</Readonly>}
        </NotificationsContext.Provider>
    )
}

export default App
