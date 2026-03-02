import Input from "./Input"


const SearchInput = ({ className="", ...props }) => {
    return <Input
        className={`search-input ${className}`}
        placeholder={"Поиск"}
        {...props}
    />
}


export default SearchInput
