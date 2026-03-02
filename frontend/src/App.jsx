import { useState, useCallback, useEffect } from "react"
import { Routes, Route } from "react-router-dom"

import "./App.css"
import AppContext from "./assets/AppContext"
import ShopsManager from "./assets/pages/ShopsManager"
import Login from "./assets/pages/Login"
import ItemsManager from "./assets/pages/ItemsManager"
import UsersManager from "./assets/pages/UsersManager"
import { Notifications } from "./assets/components/Notifications"
import QrCodeReader from "./assets/components/QrCodeReader"
import Header from "./assets/components/Header"
import RestAPI, { UserStatus } from "./RestAPI"


const App = () => {

    const [login, setLogin] = useState(
        localStorage?.email &&
        localStorage?.status &&
        localStorage?.status != UserStatus.BANNED &&
        localStorage?.user_id &&
        localStorage?.access_token &&
        localStorage?.exp > new Date().getTime() / 1000
    )
    const [notifications, setNotifications] = useState([])
    const [openQrCodeReader, setOpenQrCodeReader] = useState(false)
    const [dataQrCodeReader, setDataQrCodeReader] = useState(null)

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

    useEffect(() => {
        RestAPI.setAddNotif(addNotification)
        RestAPI.setLogouting(logouting)
    }, [addNotification, logouting])

    return (
        <AppContext.Provider value={{
            notifications,
            deleteNotification,
            addNotification,
            logining,
            logouting,
            openQrCodeReader,
            setOpenQrCodeReader,
            dataQrCodeReader,
            setDataQrCodeReader
        }}>
            <Notifications />
            <QrCodeReader />
            {
            !login
                ? <Login/>
                : <>
                    <Header></Header>
                    <Routes>
                        <Route
                            path="/"
                            element={<ShopsManager />}
                        />
                        <Route
                            path="/items/:shop_id"
                            element={<ItemsManager />}
                        />
                        <Route
                            path="/access/:shop_id"
                            element={<UsersManager />}
                        />
                    </Routes>
                </>
            }
        </AppContext.Provider>
    )
}

export default App
