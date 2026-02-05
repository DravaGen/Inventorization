import { useEffect } from "react"

import Header from "../Header/Header"
import Shops from "../Shops/Shops"


const CurrentPage = ({ logouting }) => {

    useEffect(() => {
        const ttl = (localStorage.exp - new Date().getTime() / 1000)
        const interval = setInterval(logouting,
            (ttl > 0 ? ttl : 0) * 1000
        )
        return () => {clearInterval(interval)}
    }, [localStorage])

    return (
        <>
            <Header logouting={logouting}></Header>
            <Shops></Shops>
        </>
    )
}

export default CurrentPage
