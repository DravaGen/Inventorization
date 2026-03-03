import { useState, useCallback, useRef, useEffect } from "react"
import { Input } from "../Input"


const ManagerItem = ({
    title,
    children,
    headerIndicator = "none",
    updateSelected = () => [() => {}, undefined],
    managerItemData = {},
    canSelected=false,
    ref: queryRef
}) => {
    const innerRef = useRef()
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
                [...prev, {key, ref: innerRef}]
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

    const setRefs = useCallback((element) => {
        innerRef.current = element

        if (queryRef) {
            if (typeof queryRef === 'function') {
                queryRef(element)
            } else {
                queryRef.current = element
            }
        }
    }, [innerRef, queryRef])

    useEffect(() => {
        if (innerRef.current) {
            innerRef.current.removeChecked = () => {
                setIsChecked(false)
                toggleSelectedList(false)
            }
        }

        return () => {
            if (innerRef.current) {
                delete innerRef.current.removeChecked
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
                ref={setRefs}
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
