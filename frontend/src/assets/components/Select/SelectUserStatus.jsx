import Select from "./Select"
import SelectOption from "./SelectOption"


const SelectUserStatus = ({visibleCount=3, small=false, ...props }) => {
    return (
        <Select {...props} visibleCount={visibleCount} small={small}>
            <SelectOption value="worker">Работник</SelectOption>
            <SelectOption value="admin">Администратор</SelectOption>
            <SelectOption value="owner">Владелец</SelectOption>
            <SelectOption value="banned">Заблокирован</SelectOption>
        </Select>
    )
}


export default SelectUserStatus
