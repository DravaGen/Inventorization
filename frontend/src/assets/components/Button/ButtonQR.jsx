import { useContext } from "react"

import Button from "./Button"
import AppContext from "../../AppContext"


const ButtonQR = ({ source={current: false} }) => {
    const {
        openQrReader,
    } = useContext(AppContext)

    return (
        <Button
            onClick={() => openQrReader(source)}
        >QR</Button>
    )
}


export default ButtonQR
