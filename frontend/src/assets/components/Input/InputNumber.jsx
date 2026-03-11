import InputValidator from "./InputValidator"


const InputNumber = ({ condition = () => true, ...props }) => {

    return (
        <InputValidator
            {...props}
            condition={async (e) => {return /^\d*$/.test(e) && condition(e)}}
            output={async (e) => {return e.replace(/[^0-9]/g, '')}}
        />
    )
}


export default InputNumber
