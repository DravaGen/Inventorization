import { useRef, useContext } from "react"

import Input from "../Input/Input"
import Button from "../Button/Button"
import InlineGrop from "../InlineGrop/InlineGrop"
import NotificationsContext from "../Notifications/NotificationsContext"
import RestAPI from "../../../RestAPI"


const LoginForm = ({ logining }) => {

    const emailInput = useRef(null)
    const codeInput = useRef(null)

    const {
        addNotification
    } = useContext(NotificationsContext)

    return (
        <>
            <Input
                id={"email"}
                type={"email"}
                placeholder={"Введите email"}
                ref={emailInput}
            />

            <InlineGrop>
                <Input
                    id={"code"}
                    type={"text"}
                    placeholder={"Код"}
                    ref={codeInput}
                />
                <Button
                    children={"Отправить код"}
                    onClick={async () => {
                        const response = await RestAPI.sendOtp(
                            emailInput.current.value.trim()
                        )
                        addNotification(response.message, response.type)
                    }}
                />
            </InlineGrop>

            <Button
                children={"Войти"}
                onClick={async () => {
                    const email = emailInput.current.value.trim()
                    const response = await RestAPI.login(
                        email,
                        codeInput.current.value.trim()
                    )
                    if (response.status == 200) {
                        const access_token = response.data.access_token
                        const payloadBase64 = atob(
                            access_token.split(".")[1]
                                .replace("/-/g", "+")
                                .replace("/_/g", "/")
                        )
                        const payload = JSON.parse(payloadBase64)

                        localStorage.setItem("email", email)
                        localStorage.setItem("user_id", payload.sub)
                        localStorage.setItem("status", payload.status)
                        localStorage.setItem("exp", payload.exp)
                        localStorage.setItem("access_token", access_token)

                        logining()
                        addNotification("Вход выполнен", "info")
                    } else {
                        addNotification(response.message, response.type)

                    }
                }}
            />
        </>
    )
}

export default LoginForm
