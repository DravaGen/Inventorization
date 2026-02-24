import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

import {
    Manager, ManagerBlock, ManagerItemItem,
    ManagerContent, ManagerControlGroup
} from "../components/Manager"
import { Block, BlockHeader} from "../components/Block"
import { Button } from "../components/Button"
import { AddItem } from "../components/AddItem"
import { AddShopItem } from "../components/AddShopItem"
import RestAPI from "../../RestAPI"


const ItemsManager = () => {

    const {
        shop_id
    } = useParams()


    const [allItems, setAllItems] = useState([])
    const [itemsInShop, setItemsInShop] = useState([])

    useEffect(() => {

        async function getAllItems() {
            const [ok, response] = await RestAPI.get_items()
            ok && setAllItems(response)
        }

        async function getItemsInShop() {
            const [ok, response] = await RestAPI.get_shop_items(shop_id)
            ok && setItemsInShop(response)
        }

        getAllItems()
        getItemsInShop()
    }, [shop_id])

    return (
        <Manager>

            <ManagerBlock>
                <Block>
                    <BlockHeader>Товар в магазине</BlockHeader>
                    <ManagerContent>
                        <AddShopItem items={allItems}/>
                        {itemsInShop.map((item) => <ManagerItemItem key={item.id} item={item}/>)}
                    </ManagerContent>
                    <ManagerControlGroup>
                        <Button>Добавить</Button>
                        <Button>Удалить</Button>
                    </ManagerControlGroup>
                </Block>
            </ManagerBlock>

            <ManagerBlock>
                <Block>
                    <BlockHeader>Доступный товар</BlockHeader>
                    <ManagerContent>
                        <AddItem/>
                        {allItems.map((item) => <ManagerItemItem key={item.id} item={item}/>)}
                    </ManagerContent>
                    <ManagerControlGroup>
                        <Button>Добавить</Button>
                        <Button>Переместить</Button>
                        <Button>Удалить</Button>
                    </ManagerControlGroup>
                </Block>
            </ManagerBlock>

        </Manager>
    )
}


export default ItemsManager 
