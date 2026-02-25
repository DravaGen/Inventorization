import InputNumber from "./InputNumber"


const InputCode = ({ ...props }) => {
    return <InputNumber { ...props } maxLength={6}/>
}


export default InputCode
