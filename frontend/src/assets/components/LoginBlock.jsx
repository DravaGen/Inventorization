import { useState } from "react"

import Input from "./Input"
import Button from "./Button"

const LoginBlock = () => {

    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")

    return (
        <div id="login-block">
            <div className="block">

                <h3>Вход в Inventorization</h3>
                <div id="login-form">
                    <div className="inline-group">
                        <Input
                            id={"email"}
                            type={"text"}
                            placeholder={"Введите email"}
                            value={email}
                            onChange={(e) => {setEmail(e.target.value)}}
                        />
                        <Button
                            children={"Отправить"}
                            disabled={email.trim().length == 0}
                            style={{width: "fit-conten"}}
                            onClick={() => {

                            }}
                        />
                    </div>
                    <div className="inline-group">
                        <Input
                            id={"code"}
                            type={"text"}
                            placeholder={"Код"}
                            value={code}
                            onChange={(e) => {setCode(e.target.value)}}
                        />
                    </div>
                    <Button
                        children={"Войти"}
                        onClick={() => {

                        }}
                    />
                </div>

            </div>
        </div>
    )
}

export default LoginBlock
