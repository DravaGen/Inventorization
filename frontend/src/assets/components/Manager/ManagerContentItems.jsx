import ManagerContent from "./ManagerContent"

const ManagerContentItems = ({
    elements,
    elementName,
    Component,  // eslint-disable-line no-unused-vars
    useIndexInKey=false,
    setSelectedList=()=>{},
    ...props
}) => {
    return (
        <ManagerContent {...props}>
            {elements.map(
                (element, index) => (
                    <Component
                        key={useIndexInKey ? `${element.id}-${index}` : element.id }
                        {...{ [elementName]: element }}
                        setSelectedList={setSelectedList}
                    />
            ))}
        </ManagerContent>
    )
}


export default ManagerContentItems
