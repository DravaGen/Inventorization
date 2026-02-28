import "./index.css"
export { default as Manager } from "./Manager"
export { default as ManagerBlock } from "./ManagerBlock"
export { default as ManagerContent } from "./ManagerContent"
export { default as ManagerContentItems } from "./ManagerContentItems"
export { default as ManagerControlButton } from "./ManagerControlButton"
export { default as ManagerControlGroup } from "./ManagerControlGroup"
export { default as ManagerItem } from "./ManagerItem"
export { default as ManagerItemUser } from "./ManagerItemUser"
export { default as ManagerItemAllItem } from "./ManagerItemAllItem"
export { default as ManagerItemShopItem } from "./ManagerItemShopItem"

const getActivatedCheckbox = (block) => {
    return Array.from(
        block.current
            ? block.current.querySelectorAll('input[type="checkbox"]')
            : []
    ).filter(cb => cb.checked)
}

const getElementUUID = (element) => {
    const row = element.closest('.manager-item-row')
    const idDiv = row.querySelector('.manager-item-body > div:first-child')
    return idDiv.textContent.replace('id: ', '').trim()
}

export { getActivatedCheckbox, getElementUUID }
