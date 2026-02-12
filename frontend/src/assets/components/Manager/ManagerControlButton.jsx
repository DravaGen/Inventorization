import { Button } from "../Button"


const ManagerControlButton = ({ children, ...props}) => {
    return <Button className="control-button" {...props}>{children}</Button>
}


export default ManagerControlButton