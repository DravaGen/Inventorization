import "./index.css"
export { default as Input } from "./Input"
export { default as InputInvalid } from "./InputInvalid"
export { default as InputEmail } from "./InputEmail"
export { default as InputCode } from "./InputCode"
export { default as InputNumber } from "./InputNumber"


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
    return isNnumberPositive(number) && isInteger(number)
}

export {
    isNnumberPositive, isNnumberNotMore,
    isInteger, isUnsignedInteger
}
