import InputInvalid from "./InputInvalid"


const InputNumber = ({ ...props }) => {

    return (
        <InputInvalid
            {...props}
            condition={(e) => {return !/^\d*$/.test(e) && e != ''}}
            output={(e) => {return e.replace(/[^0-9]/g, '')}}
        />
    )
}


export default InputNumber
