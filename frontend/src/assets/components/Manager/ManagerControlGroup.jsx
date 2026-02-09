import InlineGroup from "../InlineGroup/InlineGroup"
import "./index.css"

const ManagerControlGroup = ({ children }) => {
    return <InlineGroup className="control-button">{children}</InlineGroup>
}

export default ManagerControlGroup