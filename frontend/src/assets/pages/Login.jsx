import LoginBlock from "../components/Login/LoginBlock"
import LoginForm from "../components/Login/LoginForm"
import Block from "../components/Block/Block"
import BlockHeader from "../components/Block/BlockHeader"

const Login = () => {

    return (
        <LoginBlock>
            <Block>
                <BlockHeader>Вход в Inventorization</BlockHeader>
                <LoginForm></LoginForm>
            </Block>
        </LoginBlock>
    )
}

export default Login
