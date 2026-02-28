import { useCallback, useContext } from "react"
import { useNavigate } from "react-router-dom"

import { Block } from "../Block"
import { Button } from "../Button"
import AppContext from "../../AppContext"


const Header = () => {

    const navigate = useNavigate()

    const {
        logouting
    } = useContext(AppContext)

    const logicLogout = useCallback(() => {
        logouting()
        localStorage.clear()
    }, [logouting])

    const navigateRootPage = useCallback(() => {
        navigate("/")
    }, [navigate])

    const inRootPage = window.location.pathname == "/"

    return (
        <header>
            <Block>
                <div className="email">
                    {localStorage.email}
                </div>
                <Button
                    onClick={inRootPage ? logicLogout : navigateRootPage}
                >
                    {inRootPage ? "Выйти" : "Главная"}
                </Button>
            </Block>
        </header>
    )
}


export default Header
