import LoginBlock from "../components/Login/LoginBlock"
import LoginForm from "../components/Login/LoginForm"
import Block from "../components/Block/Block"
import BlockHeader from "../components/Block/BlockHeader"

const Login = ({ logining }) => {

    return (
        <LoginBlock>
            <Block>
                <BlockHeader>Вход в Inventorization</BlockHeader>
                <LoginForm logining={logining}></LoginForm>
            </Block>
        </LoginBlock>
    )
}

export default Login
