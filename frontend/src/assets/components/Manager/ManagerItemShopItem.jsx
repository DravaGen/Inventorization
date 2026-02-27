import ManagerItem from "./ManagerItem"


const ManagerItemShopItem = ({ item, isQueue = false }) => {
    return (
        <ManagerItem
            title={item.name}
            headerIndicator={isQueue ? "yellow" : "green"}
        >
            <div>id: {item.id}</div>
            <div>Количество: {item.quantity}</div>
            <div>Цена продажи: {item.price}</div>
            <div>Цена закупки: {item.price}</div>
            {isQueue && <div className="item-in-queue">Находится в очереди</div>}
        </ManagerItem>
    )
}


export default ManagerItemShopItem
