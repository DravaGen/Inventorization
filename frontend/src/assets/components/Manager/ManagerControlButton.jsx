import Button from "../Button/Button"
import "./index.css"

const ManagerControlButton = ({ children, ...props}) => {
    return <Button className="control-button" {...props}>{children}</Button>
}

export default ManagerControlButton