import { useImperativeHandle, useState, forwardRef, useCallback, useRef } from "react"
import Input from "./Input"


const InputValidator = forwardRef(({
        condition = async () => true,
        output = async (e) => e,
        updateForm = () => [() => {}, ""],
        className = "",
        defaultValue = "",
        ...props
    },
    ref
) => {
    const requestId = useRef(0)
    const [inputValue, setInputValue] = useState(defaultValue)
    const [error, setError] = useState(false)
    const [setForm, key] = updateForm()

    const checkInvalidInput = useCallback(async (v) => {

        const id = ++requestId.current
        const value = await output(v)
        const result = await condition(value)

        if (id !== requestId.current) return false
        setInputValue(value)
        setError(!result && value)

        setForm(prev => ({
            ...prev,
            [key]: result && value ? value : false
        }))

        return result && value ? value : false

    }, [output, condition, setForm, key])

    useImperativeHandle(ref, () => ({
        set value(v) {
            checkInvalidInput(v)
        },
        setValue(v) {
            return checkInvalidInput(v)
        },
        clear() {
            checkInvalidInput("")
        }
    }), [checkInvalidInput])

    return (
        <Input
            {...props}
            value={inputValue}
            className={`${className} ${error ? "error" : ""}`}
            onChange={(e) => checkInvalidInput(e.target.value)}
        />
    )
})


export default InputValidator
