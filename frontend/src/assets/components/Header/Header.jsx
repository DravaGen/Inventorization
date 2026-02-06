import { useContext } from "react"

import "./index.css"
import Block from "../Block/Block"
import Button from "../Button/Button"
import AppContext from "../../AppContext"


const Header = () => {

    const {
        logouting
    } = useContext(AppContext)

    return (
        <header>
            <Block>
                <div className="email">
                    {localStorage.email}
                </div>
                <Button
                    onClick={() => {
                        logouting()
                        localStorage.clear()
                    }}
                >logout</Button>
            </Block>
        </header>
    )
}

export default Header
