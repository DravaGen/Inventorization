

const ManagerBlock = ({
    children,
    automaticHeight=false,
    ...props
}) => {
    return (
        <div
            className={`manager-block ${automaticHeight ? "automatic-height" : ""}`}
            {...props}
        >
            {children}
        </div>
    )
}


export default ManagerBlock
