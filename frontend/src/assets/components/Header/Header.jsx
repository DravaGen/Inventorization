import "./index.css"
import Block from "../Block/Block"
import Button from "../Button/Button"


const Header = ({ logouting }) => {
    return (
        <header>
            <Block>
                <div></div>
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
