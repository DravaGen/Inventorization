import ManagerItem from "./ManagerItem"


const ManagerItemShopItem = ({ item, updateSelected }) => {
    return (
        <ManagerItem
            title={item.name}
            headerIndicator={item.isQueue ? "yellow" : "green"}
            updateSelected={updateSelected}
        >
            <div>id: {item.id}</div>
            <div>Количество: {item.quantity}</div>
            <div>Цена продажи: {item.price}</div>
            <div>Цена закупки: {item.purchase_price}</div>
            {item.isQueue && <div className="item-in-queue">Находится в очереди</div>}
        </ManagerItem>
    )
}


export default ManagerItemShopItem
