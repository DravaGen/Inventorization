import { useState } from "react"
import Input from "./Input"


const InputInvalid = (
    {
        condition,
        output = (e) => {return e},
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
    }

    return (
        <Input {...props}
            value={inputValue}
            className={`${className} ${error ? "error" : ""}`}
            onChange={checkInvalidInput}
        />
    )
}


export default InputInvalid
