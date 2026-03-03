import { useState, useCallback, useEffect } from "react"
import { useParams } from "react-router-dom"

import { AddCartItem } from "../components/Add"
import { Block, BlockHeader } from "../components/Block"
import {
    Manager, ManagerBlock, ManagerContentItems,
    ManagerItemShopItem, ManagerItemCartItem
} from "../components/Manager"
import RestAPI from "../../RestAPI"


const CartManager = () => {

    const {
        shop_id
    } = useParams()

    const [itemsInShop, setItemsInShop] = useState([])
    const [itemsInCart, setItemsInCart] = useState([])

    const getItemsInShop = useCallback(async () => {
        const [ok, response] = await RestAPI.getShopItems(shop_id)
        ok && setItemsInShop(response.items)
    }, [shop_id, setItemsInShop])

    const getItemsInCart = useCallback(async () => {
        const [ok, response] = await RestAPI.getCartItems(shop_id)
        ok && setItemsInCart(response)
    }, [shop_id, setItemsInCart])

    useEffect(() => {
        async function fetchData() {
            await getItemsInShop()
            await getItemsInCart()
        }
        fetchData()
    }, [shop_id, getItemsInShop, getItemsInCart])

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
                    />
                </Block>
            </ManagerBlock>

            <ManagerBlock>
                <Block>
                    <BlockHeader>Товар в магазине</BlockHeader>
                    <ManagerContentItems
                        elements={itemsInShop}
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
