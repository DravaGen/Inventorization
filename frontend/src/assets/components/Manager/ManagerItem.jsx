import { useState } from "react"
import Input from "../Input/Input"
import "./index.css"


const ManagerItem = ({ title, children }) => {
    const [open, setOpen] = useState(false)

    return (
        <div className="manager-item-row">
            <Input type="checkbox" />
            <div className={`manager-item ${open ? "open" : ""}`}>
                <div
                    className="manager-item-header"
                    onClick={() => setOpen(!open)}
                >{title}</div>
                <div className="manager-item-body">{children}</div>
            </div>
        </div>
    )
}


export default ManagerItem