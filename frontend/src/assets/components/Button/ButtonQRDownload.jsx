import QRCode from 'qrcode'
import Button from "./Button"


function generateAndDownloadQR(data) {
    const canvas = document.createElement('canvas');

    QRCode.toCanvas(canvas, data, {
        errorCorrectionLevel: 'H',
        margin: 2
    }, function(error) {
        if (error) {
            return;
        }
        const link = document.createElement('a');
        link.download = `${data}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}


const ButtonQRDownload = ({ qrData }) => {
    return (
        <Button
            className="button-qr-download"
            onClick={() => {generateAndDownloadQR(qrData)}}
        >
            Скачать QR
        </Button>
    )
}


export default ButtonQRDownload
