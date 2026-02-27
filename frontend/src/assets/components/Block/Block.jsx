

const Block = ({
    children,
    className="",
    ...props
}) => {
    return (
        <div
            className={`block ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}


export default Block
