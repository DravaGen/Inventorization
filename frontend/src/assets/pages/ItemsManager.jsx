import { useState, useContext, useEffect } from "react"
import { useParams } from "react-router-dom"

import Manager from "../components/Manager/Manager"
import ManagerBlock from "../components/Manager/ManagerBlock"
import ManagerItem from "../components/Manager/ManagerItem"
import ManagerContent from "../components/Manager/ManagerContent"
import ManagerControlGroup from "../components/Manager/ManagerControlGroup"
import Block from "../components/Block/Block"
import BlockHeader from "../components/Block/BlockHeader"
import Button from "../components/Button/Button"
import AppContext from "../AppContext"
import RestAPI from "../../RestAPI"


const ItemsManager = () => {

    const {
        shop_id
    } = useParams()

    const {
        addNotification
    } = useContext(AppContext)

    const [allItems, setAllItems] = useState([])
    const [itemsInShop, setItemsInShop] = useState([])

    useEffect(() => {

        async function getAllItems() {
            const response = await RestAPI.get_items()
            response.ok
                ? setAllItems(response.data)
                : addNotification(response.message, response.type)
        }

        async function getItemsInShop() {
            const response = await RestAPI.get_shop_items(shop_id)
            response.ok
                ? setItemsInShop(response.data)
                : addNotification(response.message, response.type)
        }

        getAllItems()
        getItemsInShop()
    }, [])

    return (
        <Manager>

            <ManagerBlock>
                <Block>
                    <BlockHeader>Товар в магазине</BlockHeader>
                    <ManagerContent>
                        {itemsInShop.map(
                            (item) => (<ManagerItem title={item.name}>
                                <div>id: {item.id}</div>
                                <div>Количество во всех магазинах: {item.quantity}</div>
                            </ManagerItem>)
                        )}
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
                        {allItems.map(
                            (item) => (<ManagerItem title={item.name}>
                                <div>id: {item.id}</div>
                                <div>Количество во всех магазинах: {item.quantity}</div>
                            </ManagerItem>)
                        )}
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
