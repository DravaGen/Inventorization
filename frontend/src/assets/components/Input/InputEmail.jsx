import InputInvalid from "./InputInvalid"



const checkEmailInput = (e) => {
    return !/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(e) && e != ''
}


const InputEmail = ({...props}) => {
    return <InputInvalid
        {...props}
        condition={checkEmailInput}
    />
}


export default InputEmail
