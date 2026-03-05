import { useState, useCallback, useEffect } from "react"
import { Routes, Route } from "react-router-dom"

import "./App.css"
import AppContext from "./assets/AppContext"
import {
    Login, ShopsManager, UsersManager,
    ItemsManager, CartManager
} from "./assets/pages"
import { Notifications } from "./assets/components/Notifications"
import QrCodeReader from "./assets/components/QrCodeReader"
import Header from "./assets/components/Header"
import RestAPI, {UserStatus, parseJWT, savaJWTPayload} from "./RestAPI"


const App = () => {

    const jwtPayload = parseJWT(localStorage?.access_token)
    savaJWTPayload(jwtPayload)

    const [login, setLogin] = useState(
        jwtPayload &&
        jwtPayload.status != UserStatus.BANNED &&
        jwtPayload.exp > new Date().getTime() / 1000
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
                            path="/access/:shop_id"
                            element={<UsersManager />}
                        />
                        <Route
                            path="/items/:shop_id"
                            element={<ItemsManager />}
                        />
                        <Route
                            path="/cart/:shop_id"
                            element={<CartManager />}
                        />
                    </Routes>
                </>
            }
        </AppContext.Provider>
    )
}

export default App
