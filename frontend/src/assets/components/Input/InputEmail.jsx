import InputValidator from "./InputValidator"



const checkEmailInput = (e) => {
    return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(e) && e != ''
}


const InputEmail = ({...props}) => {
    return <InputValidator
        {...props}
        maxLength={100}
        condition={checkEmailInput}
    />
}


export default InputEmail
