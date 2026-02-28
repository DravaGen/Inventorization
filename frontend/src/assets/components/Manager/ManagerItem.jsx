import { useState, useCallback } from "react"
import { Input } from "../Input"


const ManagerItem = ({
    ref,
    title,
    children,
    headerIndicator = "none",
    updateSelected = () => [() => {}, undefined]
}) => {
    const [open, setOpen] = useState(false)
    const [isChecked, setIsChecked] = useState(false)

    const toggleSelectedList = useCallback(() => {
        const [setSelected, receivedValue] = updateSelected()
        const value = receivedValue ?? title
        setSelected(prev => {
            if (prev.includes(value)) {
                return prev.filter(i => i != value)
            } else {
                return [...prev, value]
            }
        })
    }, [title, updateSelected])

    const onChangeCheckBox = useCallback((e) => {
        const value = e.target.checked
        setIsChecked(value)
        toggleSelectedList()
    }, [toggleSelectedList])

    return (
        <div className="manager-item-row" ref={ref}>
            <Input
                type="checkbox"
                value={isChecked}
                onChange={onChangeCheckBox}
            />
            <div className={`manager-item ${open ? "open" : ""}`}>
                <div
                    className={`manager-item-header`}
                    onClick={() => setOpen(!open)}
                >
                    <div className={`indicator ${headerIndicator}`}></div>
                    {title}
                </div>
                <div className="manager-item-body">{children}</div>
            </div>
        </div>
    )
}


export default ManagerItem
