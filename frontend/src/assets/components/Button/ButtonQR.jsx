import { useContext } from "react"

import Button from "./Button"
import AppContext from "../../AppContext"


const ButtonQR = () => {
    const {
        openQrReader,
    } = useContext(AppContext)
    return (
        <Button
            onClick={openQrReader}
        >QR</Button>
    )
}


export default ButtonQR
