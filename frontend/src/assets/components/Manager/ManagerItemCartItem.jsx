import ManagerItem from "./ManagerItem"


const ManagerItemCartItem = ({
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
            <div>Количество: {item.quantity}</div>
        </ManagerItem>
    )
}


export default ManagerItemCartItem
