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
        <ManagerContent>
            {elements.map(
                (element, index) => {
                    const key = useIndexInKey ? `${element.id}-${index}` : element.id
                    return <Component
                        key={key}
                        {...props}
                        {...{ [elementName]: element }}
                        updateSelected={() => [setSelectedList, key]}
                    />
            })}
        </ManagerContent>
    )
}


export default ManagerContentItems
