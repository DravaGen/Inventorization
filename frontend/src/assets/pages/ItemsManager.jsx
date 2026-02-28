import {
    useState, useEffect, useCallback,
    useRef, useContext
} from "react"
import { useParams } from "react-router-dom"

import {
    Manager, ManagerBlock,
    ManagerItemAllItem, ManagerItemShopItem,
    ManagerContent, ManagerControlButton,
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

    const logicDeleteItem = useCallback(async () => {
        const checkboxes = getActivatedCheckbox(allItemsBlockRef)

        if (checkboxes.length == 0) {
            addNotification("Не выбран ни один элемент", "warning")
            return;
        }

        for (const checkbox of checkboxes) {
            const itemId = getElementUUID(checkbox)
            await RestAPI.deleteItem(itemId)
        }

        getAllItems()
    }, [
        allItemsBlockRef, addNotification, getAllItems
    ])

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
                    <ManagerContent>
                        {itemsInShop.map(
                            (item) => <ManagerItemShopItem
                                key={item.id}
                                item={item}
                            />
                        )}
                        {itemsInShopQueues.map(
                            (item, index) => <ManagerItemShopItem
                                key={`${item.id}-${index}`}
                                item={item}
                                isQueue={true}
                            />
                        )}
                    </ManagerContent>
                    <ManagerControlButton>Удалить</ManagerControlButton>
                </Block>
            </ManagerBlock>

            <ManagerBlock>
                <Block ref={allItemsBlockRef}>
                    <BlockHeader>Доступный товар</BlockHeader>
                    <AddItem getAllItems={getAllItems}/>
                    <ManagerContent>
                        {allItems.map(
                            (item) => <ManagerItemAllItem
                                key={item.id}
                                item={item}
                            />
                        )}
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
