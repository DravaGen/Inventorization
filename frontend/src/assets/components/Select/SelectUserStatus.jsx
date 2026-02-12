import Select from "./Select"
import SelectOption from "./SelectOption"


const SelectUserStatus = ({ ...props }) => {
    return (
        <Select {...props}>
            <SelectOption value="worker">Работник</SelectOption>
            <SelectOption value="admin">Администратор</SelectOption>
            <SelectOption value="owner">Владелец</SelectOption>
        </Select>
    )
}


export default SelectUserStatus