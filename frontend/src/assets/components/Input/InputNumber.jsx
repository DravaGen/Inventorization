import InputInvalid from "./InputInvalid"


const InputNumber = ({ condition = () => true, ...props }) => {

    return (
        <InputInvalid
            {...props}
            condition={(e) => {return /^\d*$/.test(e) && condition(e)}}
            output={(e) => {return e.replace(/[^0-9]/g, '')}}
        />
    )
}


export default InputNumber
