import InlineGrop from "../InlineGrop/InlineGrop"
import "./index.css"

const ManagerControlGroup = ({ children }) => {
    return <InlineGrop className="control-button">{children}</InlineGrop>
}

export default ManagerControlGroup