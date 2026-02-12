import { useContext } from "react"
import { useNavigate } from "react-router-dom"

import { Block } from "../Block"
import { Button } from "../Button"
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
