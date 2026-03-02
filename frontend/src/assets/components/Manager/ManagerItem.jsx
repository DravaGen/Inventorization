import { useState, useCallback, useRef } from "react"
import { Input } from "../Input"


const ManagerItem = ({
    title,
    children,
    headerIndicator = "none",
    updateSelected = () => [() => {}, undefined],
    managerItemData = {},
    canSelected=false,
}) => {
    const ref = useRef()
    const [open, setOpen] = useState(false)
    const [isChecked, setIsChecked] = useState(false)

    const loggleOpen = useCallback(() => {
        setOpen(prev => !prev)
    }, [])

    const toggleSelectedList = useCallback((checked) => {
        const [setSelected, receivedValue] = updateSelected()
        const key = receivedValue ?? title
        setSelected(prev => {
            return checked ?
                [...prev, {key, ref}]
                : prev.filter(i => i.key != key)
        })
    }, [title, updateSelected])

    const onChangeCheckBox = useCallback((e) => {
        const checked = e.target.checked
        setIsChecked(checked)
        toggleSelectedList(checked)
    }, [setIsChecked, toggleSelectedList])

    const dataAttributes = {};
    Object.entries(managerItemData).forEach(([key, value]) => {
        const dataKey = `data-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        dataAttributes[dataKey] = value;
    })

    const setRemoveCheckedMethod = useCallback((element) => {
        if (element) {
            element.removeChecked = () => {
                setIsChecked(false)
                toggleSelectedList(false)
            }
        }
    }, [setIsChecked, toggleSelectedList])

    return (
        <div className="manager-item-row">
            {canSelected && <Input
                type="checkbox"
                checked={isChecked}
                onChange={onChangeCheckBox}
            />}
            <div
                ref={(element) => {
                    ref.current = element
                    setRemoveCheckedMethod(element)
                }}
                className={`manager-item ${open ? "open" : ""}`}
                {...dataAttributes}
            >
                <div
                    className={`manager-item-header`}
                    onClick={loggleOpen}
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
