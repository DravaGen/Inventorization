import Input from "./Input"
import Button from "./Button"

const LoginBlock = () => {
    return (
        <div id="login-block">
            <div className="block">

                <h3>Вход в Inventorization</h3>
                <div id="login-form">
                    <Input type={"text"} placeholder={"Введите email"} />
                    <div className="inline-group">
                        <Input type={"text"} placeholder={"Код"} />
                        <Button children={"Отправить"} />
                    </div>
                    <Button children={"Войти"} />
                </div>

            </div>
        </div>
    )
}

export default LoginBlock
