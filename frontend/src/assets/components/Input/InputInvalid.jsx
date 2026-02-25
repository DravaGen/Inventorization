import { useState } from "react"
import Input from "./Input"


const InputInvalid = ({ condition, output=(e)=>{return e}, className="", ...props}) => {
    const [inputValue, setInputValue] = useState('')
    const [error, setError] = useState(false)

    const checkInvalidInput = (e)=>{
        setInputValue(output(e.target.value))
        setError(condition(output(e.target.value)))
    }

    return (
        <Input {...props}
            value={inputValue}
            className={`${className} ${error ? "error" : ""}`.trim()}
            onChange={checkInvalidInput}
        />
    )
}


export default InputInvalid
