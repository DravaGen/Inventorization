import { useState, useCallback } from "react"
import { Routes, Route } from "react-router-dom"

import "./App.css"
import Page from "./assets/pages/Page"
import Login from "./assets/pages/Login"
import AccessShopManager from "./assets/pages/AccessShopManager"
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
            <Routes>
                <Route
                    path="/"
                    element={
                        login
                            ? <Page logouting={logouting}/>
                            : <Login logining={logining}/>
                    }
                />
                <Route
                    path="/access/:shop_id"
                    element={<AccessShopManager />}
                />
            </Routes>

        </NotificationsContext.Provider>
    )
}

export default App
