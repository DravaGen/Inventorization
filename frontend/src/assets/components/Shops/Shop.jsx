import { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Block, BlockHeader} from "../Block"
import { InputValidator } from '../Input'
import { Button } from "../Button"
import RestAPI, { UserStatus, checkUserMinStatus } from "../../../RestAPI"


const Shop = ({ id, name, address, initShops }) => {
    const navigate = useNavigate()

    const [startChange, setStartChange] = useState(false)

    const [form, setForm] = useState({name, address})

    const inputName = <InputValidator
        maxLength={32}
        placeholder={"Название"}
        updateForm={() => [setForm, "name"]}
        defaultValue={name}
    />

    const inputAddress = <InputValidator
        maxLength={64}
        placeholder={"Адресс"}
        updateForm={() => [setForm, "address"]}
        defaultValue={address}
    />

    const toggleStartChange = useCallback(() => {
        setStartChange(prev => !prev)
        setForm({name, address})
    }, [name, address, setStartChange, setForm])

    const logicChangeShopData = useCallback(async () => {
        const [ok, ] = await RestAPI.updateShop(
            id, form.name, form.address
        )
        if (ok) {
            initShops()
            toggleStartChange()
        }
    }, [id, form, initShops, toggleStartChange])


    return (
        <div className="shop">
            <Block>
                <BlockHeader>
                    <h3>{startChange ? inputName : name}</h3>
                    <p>{startChange ? inputAddress : address}</p>
                    <p>{id}</p>
                </BlockHeader>
                {
                    startChange
                    && checkUserMinStatus(UserStatus.OWNER)
                    && <Button
                        className={"confirm-button"}
                        disabled={
                            !Object.values(form).every(Boolean) ||
                            (name == form.name && address == form.address)
                        }
                        onClick={logicChangeShopData}
                    >Применить</Button>
                }
                {
                    checkUserMinStatus(UserStatus.OWNER)
                    && <Button
                        className={"edit-button"}
                        onClick={toggleStartChange}
                    >{startChange ? "Отменить" : "Изменить"}</Button>
                }
                {
                    checkUserMinStatus(UserStatus.WORKER)
                    && <Button
                        onClick={() => navigate(`/cart/${id}`)}
                    >Корзина</Button>
                }
                {
                    checkUserMinStatus(UserStatus.ADMIN)
                    && <Button
                        onClick={() => navigate(`/items/${id}`)}
                    >Добавить товар</Button>
                }
                {/* {
                    checkUserMinStatus(UserStatus.ADMIN)
                    && <Button>Принять товар</Button>
                } */}
                {
                    checkUserMinStatus(UserStatus.OWNER)
                    && <Button
                        onClick={() => navigate(`/access/${id}`)}
                    >Выдать доступ</Button>
                }
                {
                    checkUserMinStatus(UserStatus.OWNER)
                    && <Button
                        onClick={() => navigate(`/stats/${id}`)}
                    >Статистика</Button>
                }
            </Block>
        </div>
    )
}


export default Shop
