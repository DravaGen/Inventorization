import { useImperativeHandle, useState, forwardRef} from "react"
import Input from "./Input"


const InputValidator = forwardRef((
    {
        condition = () => {return true},
        output = (e) => {return e},
        updateForm = () => {return [() => {}, ""]},
        className = "",
        ...props
    },
    ref
) => {
    const [inputValue, setInputValue] = useState('')
    const [error, setError] = useState(false)
    const [setForm, key] = updateForm()

    const checkInvalidInput = (v) => {
        const value = output(v.trim())
        const result = condition(value)
        setInputValue(value)
        setError(!result && value)
        setForm(prev => ({...prev, [key]: result && value ? value : false}))
    }

    useImperativeHandle(ref, () => ({
        get value() {
            return inputValue
        },
        set value(v) {
            checkInvalidInput(v)
        },
        clear() {
            setInputValue("")
            setForm(prev => ({...prev, [key]: false}))
        }
    }), [setInputValue, setForm])

    return (
        <Input {...props}
            value={inputValue}
            className={`${className} ${error ? "error" : ""}`}
            onChange={(e) => {checkInvalidInput(e.target.value)}}
        />
    )
})


export default InputValidator
