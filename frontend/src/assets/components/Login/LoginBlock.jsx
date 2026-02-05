
import "./index.css"
import Block from "../Block/Block"
import BlockHeader from "../Block/BlockHeader"
import LoginForm from "./LoginForm"


const LoginBlock = ({ logining }) => {

    return (
        <div id="login-block">
            <Block>
                <BlockHeader>Вход в Inventorization</BlockHeader>
                <LoginForm logining={logining}></LoginForm>
            </Block>

        </div>
    )
}

export default LoginBlock
