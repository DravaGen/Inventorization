import { useContext } from "react"
import { useNavigate } from "react-router-dom"

import "./index.css"
import Block from "../Block/Block"
import Button from "../Button/Button"
import AppContext from "../../AppContext"


const Header = () => {

    const navigate = useNavigate()

    const {
        logouting
    } = useContext(AppContext)

    return (
        <header>
            <Block>
                <div className="email">
                    {localStorage.email}
                </div>

                {
                    window.location.pathname == "/"
                        ? <Button
                            onClick={() => {
                                logouting()
                                localStorage.clear()
                            }}
                        >Выйти</Button>
                        : <Button
                            onClick={() => {
                                navigate("/")
                            }}
                        >
                            Главная
                        </Button>
                }

            </Block>
        </header>
    )
}

export default Header
