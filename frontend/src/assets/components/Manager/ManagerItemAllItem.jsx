import ManagerItem from "./ManagerItem"


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
        </ManagerItem>
    )
}


export default ManagerItemAllItem
