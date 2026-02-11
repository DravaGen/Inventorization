import "./index.css"

const ManagerBlock = ({ children, ...props}) => {
    return <div className="manager-block" {...props}>{children}</div>
}

export default ManagerBlock
