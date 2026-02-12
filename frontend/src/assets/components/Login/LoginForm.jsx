import { useContext, useEffect, useRef } from "react"

import Input from "../Input/Input"
import Button from "../Button/Button"
import InlineGroup from "../InlineGroup/InlineGroup"
import AppContext from "../../AppContext"
import RestAPI, { UserStatus } from "../../../RestAPI"


const LoginForm = () => {

    const {
        logining,
        addNotification,
        setOpenQrCodeReader,
        dataQrCodeReader,
        setDataQrCodeReader
    } = useContext(AppContext)

    const emailInput = useRef(null)
    const codeInput = useRef(null)

    useEffect(() => {
        async function loginAboutQrCode() {
            if (!dataQrCodeReader) return
            emailInput.current.value = dataQrCodeReader
            const [ok, ] = await RestAPI.sendOtp(
                emailInput.current.value.trim()
            )
            ok && addNotification("Код отправлен")
            setDataQrCodeReader(null)
        }
        loginAboutQrCode()
    }, [dataQrCodeReader])

    return (
        <>
            <InlineGroup>
                <Input
                    id={"email"}
                    type={"email"}
                    placeholder={"Введите email"}
                    ref={emailInput}
                />
                <Button
                    onClick={() => setOpenQrCodeReader(true)}
                >QR</Button>
            </InlineGroup>

            <InlineGroup>
                <Input
                    id={"code"}
                    type={"text"}
                    placeholder={"Код"}
                    ref={codeInput}
                />
                <Button
                    children={"Отправить код"}
                    onClick={async () => {
                        const [ok, ] = await RestAPI.sendOtp(
                            emailInput.current.value.trim()
                        )
                        ok && addNotification("Код отправлен")
                    }}
                />
            </InlineGroup>

            <Button
                children={"Войти"}
                onClick={async () => {
                    const email = emailInput.current.value.trim()
                    const [ok, response] = await RestAPI.login(
                        email,
                        codeInput.current.value.trim()
                    )

                    if (!ok) return
                    const access_token = response.access_token
                    const payloadBase64 = atob(
                        access_token.split(".")[1]
                            .replace("/-/g", "+")
                            .replace("/_/g", "/")
                    )
                    const payload = JSON.parse(payloadBase64)

                    if (payload.status == UserStatus.BANNED) {
                        addNotification("Отказано в доступе", "error")
                        codeInput.current.value = ""
                        return
                    }

                    localStorage.setItem("email", email)
                    localStorage.setItem("user_id", payload.sub)
                    localStorage.setItem("status", payload.status)
                    localStorage.setItem("exp", payload.exp)
                    localStorage.setItem("access_token", access_token)

                    logining()
                    addNotification("Вход выполнен")
                }}
            />
        </>
    )
}

export default LoginForm
