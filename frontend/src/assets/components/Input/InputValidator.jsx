import { useImperativeHandle, useState, forwardRef, useCallback} from "react"
import Input from "./Input"


const InputValidator = forwardRef((
    {
        condition = () => {return true},
        output = (e) => {return e},
        updateForm = () => {return [() => {}, ""]},
        className = "",
        defaultValue = "",
        ...props
    },
    ref
) => {
    const [inputValue, setInputValue] = useState(defaultValue)
    const [error, setError] = useState(false)
    const [setForm, key] = updateForm()

    const checkInvalidInput = useCallback((v) => {
        const value = output(v)
        const result = condition(value)
        setInputValue(value)
        setError(!result && value)
        setForm(prev => ({...prev, [key]: result && value ? value : false}))
    }, [output, condition, setInputValue, setError, setForm, key])

    useImperativeHandle(ref, () => ({
        set value(v) {
            checkInvalidInput(v)
        },
        clear() {
            checkInvalidInput("")
        }
    }), [checkInvalidInput])

    return (
        <Input {...props}
            value={inputValue}
            className={`${className} ${error ? "error" : ""}`}
            onChange={(e) => {checkInvalidInput(e.target.value)}}
        />
    )
})


export default InputValidator
