import { LoginBlock, LoginForm } from "../components/Login"
import { Block, BlockHeader } from "../components/Block"


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
