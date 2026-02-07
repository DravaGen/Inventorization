import { useContext } from "react"

import BarcodeScanner from "react-qr-barcode-scanner"
import Block from "../Block/Block"
import Button from "../Button/Button"
import AppContext from "../../AppContext"
import "./index.css"


const QrCodeReader = () => {

    const {
        openQrCodeReader,
        setOpenQrCodeReader,
        setDataQrCodeReader
    } = useContext(AppContext)

    return (
        <div id="qr-code-reader" className={!openQrCodeReader ? "qr-code-reader-hide" : ""}>
            <Block>
                {
                    openQrCodeReader &&
                    <BarcodeScanner
                        onUpdate={(error, result) => {
                            result ? setDataQrCodeReader(result) : null
                            result ? setOpenQrCodeReader(false) : null
                        }}
                        onError={(error) => {setDataQrCodeReader(error)}}
                        facingMode="environment"
                    />
                }
                <Button
                    onClick={() => setOpenQrCodeReader(false)}
                >Закрыть камеру</Button>
            </Block>
        </div>
    )
}

export default QrCodeReader
