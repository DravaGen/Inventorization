

const ManagerContent = ({ children, ...props }) => {

    return (
        <div
            className="manager-content"
            {...props}
        >
            {children}
        </div>
    )
}


export default ManagerContent
