import { useEffect } from "react"

import Header from "../components/Header/Header"
import Shops from "../components/Shops/Shops"


const Page = ({ logouting }) => {

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

export default Page
