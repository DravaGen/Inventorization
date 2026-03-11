import "./index.css"
export { default as Input } from "./Input"
export { default as InputValidator } from "./InputValidator"
export { default as InputEmail } from "./InputEmail"
export { default as InputCode } from "./InputCode"
export { default as InputNumber } from "./InputNumber"
export { default as SearchInput } from "./SearchInput"


function isUnsignedNnumber(number) {
    return +number >= 0
}

function isNnumberPositive(number) {
    return +number > 0
}

function isNnumberNotMore(number, max) {
    return +number <= max
}

function isInteger(number) {
    return isNnumberNotMore(number, 2147483647)
}

function isUnsignedInteger(number) {
    return isUnsignedNnumber(number) && isInteger(number)
}

async function isUnsignedIntegerPositive(number) {
    return isNnumberPositive(number) && isInteger(number)
}

const filterBySearch = (list, search, getters) => {
    const value = search.trim().toLowerCase()

    if (!value) return list

    return list.filter(item =>
        getters.some(get =>
            (get(item) ?? "")
                .toString()
                .toLowerCase()
                .includes(value)
        )
    )
}

export {
    isUnsignedNnumber, isNnumberPositive,
    isNnumberNotMore, isInteger,
    isUnsignedInteger, isUnsignedIntegerPositive,
    filterBySearch
}
