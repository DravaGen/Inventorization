import { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"

import {
    Manager, ManagerBlock,
    ManagerItemAllItem, ManagerItemShopItem,
    ManagerContentItems, ManagerControlButton,
    getElementUUID
} from "../components/Manager"
import { Block, BlockHeader} from "../components/Block"
import { AddItem } from "../components/Add"
import { AddShopItem } from "../components/Add"
import RestAPI from "../../RestAPI"


const ItemsManager = () => {

    const {
        shop_id
    } = useParams()

    const [allItems, setAllItems] = useState([])
    const [itemsInShop, setItemsInShop] = useState([])
    const [itemsInShopQueues, setItemsInShopQueues] = useState([])

    const [shopItemsSlected, setShopItemsSlected] = useState([])
    const [allItemsSlected, setAllItemsSlected] = useState([])

    const getAllItems = useCallback(async () => {
        const [ok, response] = await RestAPI.getItems()
        ok && setAllItems(response)
    }, [setAllItems])

    const getItemsInShop = useCallback(async () => {
        const [ok, response] = await RestAPI.getShopItems(shop_id)
        ok && setItemsInShop(response.items)
        ok && setItemsInShopQueues(response.queues)
    }, [shop_id, setItemsInShop])

    useEffect(() => {
        async function fetchData() {
            await getAllItems()
            await getItemsInShop()
        }
        fetchData()
    }, [shop_id, getAllItems, getItemsInShop])

    const logicDeleteItemInShop = useCallback(async () => {

        for (const element of shopItemsSlected) {
            let ok = false
            const itemsManagerHTML = element.ref.current
            const itemId = getElementUUID(itemsManagerHTML)
            if (itemsManagerHTML.dataset.isQueue == "true") {
                [ok, ] = await RestAPI.deleteShopItemQueue(
                    shop_id, itemId,
                    itemsManagerHTML.dataset.createdAd
                )
            } else {
                [ok, ] = await RestAPI.deleteShopItem(shop_id, itemId)
            }
            ok & itemsManagerHTML.removeChecked()
        }

        await getItemsInShop()
    }, [shop_id, shopItemsSlected, getItemsInShop])

    const logicDeleteItem = useCallback(async () => {

        for (const element of allItemsSlected) {
            const itemsManagerHTML = element.ref.current
            const itemId = getElementUUID(itemsManagerHTML)
            const [ok, ] = await RestAPI.deleteItem(itemId)
            ok & itemsManagerHTML.removeChecked()
        }

        getAllItems()
    }, [allItemsSlected, getAllItems])

    const shopItems = [
        ...itemsInShop.map(item => ({ ...item, isQueue: false })),
        ...itemsInShopQueues.map(item => ({ ...item, isQueue: true }))
    ]

    return (
        <Manager>

            <ManagerBlock>
                <Block>
                    <BlockHeader>Товар в магазине</BlockHeader>
                    <AddShopItem
                        shop_id={shop_id}
                        items={allItems}
                        getItemsInShop={getItemsInShop}
                        getAllItems={getAllItems}
                    />
                    <ManagerContentItems
                        elements={shopItems}
                        elementName={"item"}
                        Component={ManagerItemShopItem}
                        useIndexInKey={true}
                        setSelectedList={setShopItemsSlected}
                        useSearchInput={() => [true, "name"]}
                        canSelected={true}
                    />
                    <ManagerControlButton
                        onClick={logicDeleteItemInShop}
                        disabled={!shopItemsSlected.length}
                    >Удалить</ManagerControlButton>
                </Block>
            </ManagerBlock>

            <ManagerBlock>
                <Block>
                    <BlockHeader>Доступный товар</BlockHeader>
                    <AddItem getAllItems={getAllItems}/>
                    <ManagerContentItems
                        elements={allItems}
                        elementName={"item"}
                        Component={ManagerItemAllItem}
                        setSelectedList={setAllItemsSlected}
                        useSearchInput={() => [true, "name"]}
                        canSelected={true}
                    />
                    <ManagerControlButton
                        disabled={!allItemsSlected.length}
                        onClick={logicDeleteItem}
                    >Удалить</ManagerControlButton>
                </Block>
            </ManagerBlock>

        </Manager>
    )
}


export default ItemsManager
