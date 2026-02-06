import { useState, useCallback, useEffect } from "react"
import { Routes, Route } from "react-router-dom"

import "./App.css"
import AppContext from "./assets/AppContext"
import ShopsPage from "./assets/pages/ShopsPage"
import Login from "./assets/pages/Login"
import AccessShopManager from "./assets/pages/AccessShopManager"
import Notifications from "./assets/components/Notifications/Notifications"
import Header from "./assets/components/Header/Header"


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

    useEffect(() => {
        if (!login) return

        const ttl = (localStorage.exp - new Date().getTime() / 1000)
        const interval = setTimeout(logouting,
            (ttl > 0 ? ttl : 0) * 1000
        )
        return () => {clearTimeout(interval)}
    }, [login, logouting])

    return (
        <AppContext.Provider value={{
            notifications,
            deleteNotification,
            addNotification,
            logining,
            logouting
        }}>
            <Notifications />
            {
            !login
                ? <Login/>
                : <>
                    <Header></Header>
                    <Routes>
                        <Route
                            path="/"
                            element={<ShopsPage />}
                        />
                        <Route
                            path="/access/:shop_id"
                            element={<AccessShopManager />}
                        />
                    </Routes>
                </>
            }
        </AppContext.Provider>
    )
}

export default App
