import InputValidator from "./InputValidator"


const InputNumber = ({
    condition = async () => true,
    output = async (e) => e,
    ...props
}) => {

    return (
        <InputValidator
            {...props}
            condition={async (e) => {return /^\d*$/.test(e) && await condition(e)}}
            output={async (e) => {
                const number = e.replace(/[^0-9]/g, '')
                return output(number)
            }}
        />
    )
}


export default InputNumber
