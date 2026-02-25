import { useState, useEffect, useCallback, useRef, useContext } from "react"
import { useParams } from "react-router-dom"

import {
    Manager, ManagerBlock, ManagerItemItem,
    ManagerContent, ManagerControlButton
} from "../components/Manager"
import { Block, BlockHeader} from "../components/Block"
import { AddItem } from "../components/AddItem"
import { AddShopItem } from "../components/AddShopItem"
import RestAPI from "../../RestAPI"
import AppContext from "../AppContext"


const ItemsManager = () => {

    const {
        shop_id
    } = useParams()

    const {
        addNotification
    } = useContext(AppContext)

    const [allItems, setAllItems] = useState([])
    const [itemsInShop, setItemsInShop] = useState([])

    const allItemsBlockRef = useRef(null)

    const getAllItems = useCallback(async () => {
        const [ok, response] = await RestAPI.get_items()
        ok && setAllItems(response)
    }, [setAllItems])

    const getItemsInShop = useCallback(async () => {
        const [ok, response] = await RestAPI.get_shop_items(shop_id)
        ok && setItemsInShop(response)
    }, [shop_id, setItemsInShop])

    useEffect(() => {
        async function fetchData() {
            await getAllItems()
            await getItemsInShop()
        }
        fetchData()
    }, [shop_id, getAllItems, getItemsInShop])

    const getActivatedCheckbox = useCallback((block) => {
        return Array.from(
            block.current
                ? block.current.querySelectorAll('input[type="checkbox"]')
                : []
        ).filter(cb => cb.checked)
    }, [])

    const getElementUUID = useCallback((element) => {
        const row = element.closest('.manager-item-row')
        const id_div = row.querySelector('.manager-item-body > div:first-child')
        return id_div.textContent.replace('id: ', '').trim()
    }, [])

    const logicDeleteItem = useCallback(async () => {
        const checkboxes = getActivatedCheckbox(allItemsBlockRef)

        if (checkboxes.length == 0) {
            addNotification("Не выбран ни один элемент", "warning")
            return;
        }

        for (const checkbox of checkboxes) {
            const item_id = getElementUUID(checkbox)
            await RestAPI.delete_item(item_id)
        }

        getAllItems()
    }, [
        allItemsBlockRef, addNotification,
        getActivatedCheckbox, getElementUUID, getAllItems
    ])

    return (
        <Manager>

            <ManagerBlock>
                <Block>
                    <BlockHeader>Товар в магазине</BlockHeader>
                    <ManagerContent>
                        <AddShopItem items={allItems}/>
                        {itemsInShop.map((item) => <ManagerItemItem key={item.id} item={item}/>)}
                    </ManagerContent>
                    <ManagerControlButton>Удалить</ManagerControlButton>
                </Block>
            </ManagerBlock>

            <ManagerBlock>
                <Block ref={allItemsBlockRef}>
                    <BlockHeader>Доступный товар</BlockHeader>
                    <ManagerContent>
                        <AddItem getAllItems={getAllItems}/>
                        {allItems.map((item) => <ManagerItemItem key={item.id} item={item}/>)}
                    </ManagerContent>
                    <ManagerControlButton
                        onClick={async () => {logicDeleteItem()}}
                    >Удалить</ManagerControlButton>
                </Block>
            </ManagerBlock>

        </Manager>
    )
}


export default ItemsManager
