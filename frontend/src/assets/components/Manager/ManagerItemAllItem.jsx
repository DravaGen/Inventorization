import ManagerItem from "./ManagerItem"


const ManagerItemAllItem = ({ item, setSelectedList }) => {
    return (
        <ManagerItem
            title={item.name}
            setSelectedList={setSelectedList}
        >
            <div>id: {item.id}</div>
            <div>Количество во всех магазинах: {item.quantity}</div>
        </ManagerItem>
    )
}


export default ManagerItemAllItem
