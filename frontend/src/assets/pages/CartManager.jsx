import { useState, useCallback, useEffect } from "react"
import { useParams } from "react-router-dom"

import { SearchInput } from "../components/Input"
import { Block, BlockHeader } from "../components/Block"
import {
    Manager, ManagerBlock, ManagerContentItems,
    ManagerItemShopItem
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
        ok && setItemsInCart(response.items)
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
