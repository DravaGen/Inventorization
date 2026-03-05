import { useContext } from "react"

import BarcodeScanner from "react-qr-barcode-scanner"
import { Block } from "../Block"
import { Button } from "../Button"
import AppContext from "../../AppContext"


const QrCodeReader = () => {

    const {
        openQrCodeReader,
        openQrReader,
        closeQrReader,
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
                            result ? closeQrReader() : null
                        }}
                        facingMode="environment"
                    />
                }
                <Button
                    onClick={closeQrReader}
                >Закрыть камеру</Button>
            </Block>
        </div>
    )
}


export default QrCodeReader
