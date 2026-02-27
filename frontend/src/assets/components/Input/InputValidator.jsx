import { useState } from "react"
import Input from "./Input"


const InputValidator = (
    {
        condition,
        output = (e) => {return e},
        updateForm = () => {return [() => {}, ""]},
        className = "",
        ...props
    }
) => {
    const [inputValue, setInputValue] = useState('')
    const [error, setError] = useState(false)

    const checkInvalidInput = (e) => {
        const value = output(e.target.value.trim())
        const result = condition(value)
        setInputValue(value)
        setError(!result && value)

        const [setForm, key] = updateForm()
        setForm(prev => ({...prev, [key]: result && value ? value : false}))
    }

    return (
        <Input {...props}
            value={inputValue}
            className={`${className} ${error ? "error" : ""}`}
            onChange={checkInvalidInput}
        />
    )
}


export default InputValidator
