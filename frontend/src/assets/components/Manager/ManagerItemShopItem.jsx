import ManagerItem from "./ManagerItem"
import { UserStatus, checkUserMinStatus } from "../../../RestAPI"


const ManagerItemShopItem = ({
    item,
    updateSelected,
    ...props
}) => {

    const managerItemData = {
        createdAd: item.created_at,
        isQueue: item.isQueue
    }

    let headerIndicator = "green"
    if (item.quantity == 0)
        headerIndicator = "red"
    if (item.isQueue)
        headerIndicator = "yellow"

    return (
        <ManagerItem
            title={item.name}
            headerIndicator={headerIndicator}
            updateSelected={updateSelected}
            managerItemData={managerItemData}
            {...props}
        >
            <div>id: {item.id}</div>
            <div>Количество: {item.quantity}</div>
            <div>Цена продажи: {item.price}</div>
            {
                checkUserMinStatus(UserStatus.ADMIN) &&
                <div>Цена закупки: {item.purchase_price}</div>
            }
            {item.isQueue && <div className="item-in-queue">Находится в очереди</div>}
        </ManagerItem>
    )
}


export default ManagerItemShopItem
