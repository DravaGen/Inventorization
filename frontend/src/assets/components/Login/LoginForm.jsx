import { useCallback, useContext, useEffect, useRef, useState } from "react"

import { InputEmail, InputCode } from "../Input"
import { Button, ButtonQR } from "../Button"
import { InlineGroup } from "../InlineGroup"
import AppContext from "../../AppContext"
import RestAPI, { UserStatus, parseJWT } from "../../../RestAPI"


const LoginForm = () => {

    const {
        logining,
        addNotification,
        dataQrCodeReader,
        setDataQrCodeReader
    } = useContext(AppContext)

    const emailInput = useRef(null)
    const codeInput = useRef(null)

    const [form, setForm] = useState({
        email: false,
        code: false
    })

    useEffect(() => {
        async function loginAboutQrCode() {
            if (!dataQrCodeReader) return
            const email = await emailInput.current.setValue(dataQrCodeReader.text)
            setDataQrCodeReader(null)
            if (!email) return
            const [ok, ] = await RestAPI.sendOtp(email)
            ok && addNotification("Код отправлен")
        }
        loginAboutQrCode()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataQrCodeReader])

    const logicSendCode = useCallback(async () => {
        const [ok, ] = await RestAPI.sendOtp(form.email)
        ok && addNotification("Код отправлен")
    }, [form, addNotification])


    const logicLogin = useCallback(async () => {
        const [ok, response] = await RestAPI.login(
            form.email, form.code
        )
        if (!ok) return

        const access_token = response.access_token
        const payload = parseJWT(access_token)

        if (payload.status == UserStatus.BANNED) {
            codeInput.current.clear()
            addNotification("Отказано в доступе", "error")
            return
        }

        localStorage.setItem("email", form.email)
        localStorage.setItem("access_token", access_token)

        logining()
        codeInput.current.clear()
        emailInput.current.clear()
        addNotification("Вход выполнен")
    }, [form, codeInput, emailInput, logining, addNotification])

    return (
        <>
            <InlineGroup>
                <InputEmail
                    ref={emailInput}
                    updateForm={() => [setForm, "email"]}
                    placeholder={"Введите email"}
                />
                <ButtonQR/>
            </InlineGroup>

            <InlineGroup>
                <InputCode
                    ref={codeInput}
                    updateForm={() => [setForm, "code"]}
                    placeholder={"Код"}
                />
                <Button
                    disabled={!form.email}
                    children={"Отправить код"}
                    onClick={logicSendCode}
                />
            </InlineGroup>

            <Button
                disabled={!Object.values(form).every(Boolean)}
                onClick={logicLogin}
            >Войти</Button>
        </>
    )
}


export default LoginForm
