import {
    useState, useEffect, useCallback,
    useRef, useContext
} from "react"
import { useParams } from "react-router-dom"

import {
    Manager, ManagerBlock,
    ManagerItemAllItem, ManagerItemShopItem,
    ManagerContentItems, ManagerControlButton,
    getActivatedCheckbox, getElementUUID
} from "../components/Manager"
import { Block, BlockHeader} from "../components/Block"
import { AddItem } from "../components/Add"
import { AddShopItem } from "../components/Add"
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
    const [itemsInShopQueues, setItemsInShopQueues] = useState([])

    const allItemsBlockRef = useRef(null)

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
        const checkboxes = getActivatedCheckbox(allItemsBlockRef)

        for (const checkbox of checkboxes) {
            const itemId = getElementUUID(checkbox)
            await RestAPI.deleteItem(itemId)
        }

        getAllItems()
    }, [
        allItemsBlockRef, addNotification, getAllItems
    ])

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
                    />
                    <ManagerContentItems
                        elements={shopItems}
                        elementName={"item"}
                        Component={ManagerItemShopItem}
                        useIndexInKey={true}
                        setSelectedList={setShopItemsSlected}
                    />
                    <ManagerControlButton
                        onClick={logicDeleteItemInShop}
                        disabled={!shopItemsSlected.length}
                    >Удалить</ManagerControlButton>
                </Block>
            </ManagerBlock>

            <ManagerBlock>
                <Block ref={allItemsBlockRef}>
                    <BlockHeader>Доступный товар</BlockHeader>
                    <AddItem getAllItems={getAllItems}/>
                    <ManagerContentItems
                        elements={allItems}
                        elementName={"item"}
                        Component={ManagerItemAllItem}
                        setSelectedList={setAllItemsSlected}
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
