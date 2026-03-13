import ManagerItem from "./ManagerItem"
import { ButtonQRDownload } from "../Button"

const ManagerItemAllItem = ({
    item,
    updateSelected,
    ...props
}) => {
    return (
        <ManagerItem
            title={item.name}
            updateSelected={updateSelected}
            {...props}
        >
            <div>id: {item.id}</div>
            <div>Количество во всех магазинах: {item.quantity}</div>
            <ButtonQRDownload qrData={item.id} />
        </ManagerItem>
    )
}


export default ManagerItemAllItem
