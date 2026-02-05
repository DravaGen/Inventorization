import { useState, useCallback } from "react"

import "./App.css"
import LoginBlock from "./assets/components/Login/LoginBlock"
import CurrentPage from "./assets/components/CurrentPage/CurrentPage"
import Notifications from "./assets/components/Notifications/Notifications"
import NotificationsContext from "./assets/components/Notifications/NotificationsContext"


const App = () => {

    const [login, setLogin] = useState(
        localStorage?.email &&
        localStorage?.status &&
        localStorage?.user_id &&
        localStorage?.access_token &&
        localStorage?.exp > new Date().getTime() / 1000
    )
    const [notifications, setNotifications] = useState([])

    const logining = useCallback(() => {
        setLogin(true)
    }, [])

    const logouting = useCallback(() => {
        setLogin(false)
    }, [])

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
            {
                login
                    ? <CurrentPage logouting={logouting}/>
                    : <LoginBlock logining={logining}/>
            }

        </NotificationsContext.Provider>
    )
}

export default App
