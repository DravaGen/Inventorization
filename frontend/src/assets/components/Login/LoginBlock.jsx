
import "./index.css"
import Block from "../Block/Block"
import LoginForm from "./LoginForm"


const LoginBlock = ({ logining }) => {

    return (
        <div id="login-block">
            <Block>
                <h3>Вход в Inventorization</h3>
                <LoginForm logining={logining}></LoginForm>
            </Block>

        </div>
    )
}

export default LoginBlock
