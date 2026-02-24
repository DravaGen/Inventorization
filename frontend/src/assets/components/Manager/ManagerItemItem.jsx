import ManagerItem from "./ManagerItem"


const ManagerItemItem = ({ item }) => {
    return (
        <ManagerItem title={item.name}>
            <div>id: {item.id}</div>
            <div>Количество во всех магазинах: {item.quantity}</div>
        </ManagerItem>
    )
}


export default ManagerItemItem
