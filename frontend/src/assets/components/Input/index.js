import "./index.css"
export { default as Input } from "./Input"
export { default as InputValidator } from "./InputValidator"
export { default as InputEmail } from "./InputEmail"
export { default as InputCode } from "./InputCode"
export { default as InputNumber } from "./InputNumber"
export { default as SearchInput } from "./SearchInput"


function isNnumberPositive(number) {
    return +number > 0
}

function isNnumberNotMore(number, max) {
    return +number <= max
}

function isInteger(number) {
    return isNnumberNotMore(number, 2147483647)
}

function isUnsignedIntegerPositive(number) {
    return isNnumberPositive(number) && isInteger(number)
}

export {
    isNnumberPositive, isNnumberNotMore,
    isInteger, isUnsignedIntegerPositive
}
