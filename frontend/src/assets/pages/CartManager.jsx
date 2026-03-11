import { useState, useCallback, useEffect } from "react"
import { useParams } from "react-router-dom"

import { AddCartItem } from "../components/Add"
import { Block, BlockHeader } from "../components/Block"
import {
    Manager, ManagerBlock, ManagerContentItems,
    ManagerItemShopItem, ManagerItemCartItem,
    ManagerControlGroup
} from "../components/Manager"
import { Button } from "../components/Button"
import RestAPI from "../../RestAPI"


const CartManager = () => {

    const {
        shop_id
    } = useParams()

    const [itemsInCart, setItemsInCart] = useState([])
    const [itemsInShop, setItemsInShop] = useState([])
    const [itemsInShopQueues, setItemsInShopQueues] = useState([])

    const shopItemsMap = new Map(itemsInShop.map(item => [item.id, item]))

    const totalPrice = itemsInCart.reduce((sum, item) => {
        return sum + item.quantity * shopItemsMap.get(item.id).price
    }, 0)

    const getItemsInShop = useCallback(async () => {
        const [ok, response] = await RestAPI.getShopItems(shop_id)
        ok && setItemsInShop(response.items)
        ok && setItemsInShopQueues(response.queues)
    }, [shop_id, setItemsInShop])

    const getItemsInCart = useCallback(async () => {
        const [ok, response] = await RestAPI.getCartItems(shop_id)
        ok && setItemsInCart(response)
    }, [shop_id, setItemsInCart])

    const logicClearCart = useCallback(async () => {
        const [ok, ] = await RestAPI.clearCart(shop_id)
        ok && getItemsInCart()
    }, [shop_id, getItemsInCart])

    const logicConfirmCart = useCallback(async () => {
        const [ok, ] = await RestAPI.confirmCart(shop_id)
        ok && getItemsInCart()
    }, [shop_id, getItemsInCart])

    useEffect(() => {
        async function fetchData() {
            await getItemsInShop()
            await getItemsInCart()
        }
        fetchData()
    }, [shop_id, getItemsInShop, getItemsInCart])

    const shopItems = [
        ...itemsInShop.map(item => ({ ...item, isQueue: false })),
        ...itemsInShopQueues.map(item => ({ ...item, isQueue: true }))
    ]

    return (
        <Manager>

            <ManagerBlock>
                <Block>
                    <BlockHeader>Корзина покупок</BlockHeader>
                    <AddCartItem
                        items={itemsInShop}
                        shop_id={shop_id}
                        getItemsInCart={getItemsInCart}
                    />
                    <ManagerContentItems
                        elements={itemsInCart}
                        elementName={"item"}
                        Component={ManagerItemCartItem}
                        useIndexInKey={true}
                        useSearchInput={() => [true, "name"]}
                        shop_id={shop_id}
                        getItemsInCart={getItemsInCart}
                    />
                    <ManagerControlGroup>
                        <div>Итог: {totalPrice}</div>
                        <div className="control-button">
                            <Button
                                onClick={logicClearCart}
                            >Очистить</Button>
                            <Button
                                onClick={logicConfirmCart}
                            >Подтвердить</Button>
                        </div>
                    </ManagerControlGroup>
                </Block>
            </ManagerBlock>

            <ManagerBlock>
                <Block>
                    <BlockHeader>Товар в магазине</BlockHeader>
                    <ManagerContentItems
                        elements={shopItems}
                        elementName={"item"}
                        Component={ManagerItemShopItem}
                        useIndexInKey={true}
                        useSearchInput={() => [true, "name"]}
                    />
                </Block>
            </ManagerBlock>

        </Manager>
    )
}


export default CartManager
