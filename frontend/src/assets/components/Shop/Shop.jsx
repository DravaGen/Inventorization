import { useNavigate } from "react-router-dom"

import "./index.css"
import Block from "../Block/Block"
import BlockHeader from "../Block/BlockHeader"
import Button from "../Button/Button"


const Shop = ({ id, name, address }) => {
    const navigate = useNavigate()

    return (
        <div className="shop">
            <Block>
                <BlockHeader>
                    <h3>{name}</h3>
                    <p>{address}</p>
                    <p>{id}</p>
                </BlockHeader>
                <Button className={"edit-button"}>Изменить</Button>
                <Button>Корзина</Button>
                <Button>Добавить товар</Button>
                <Button>Принять товар</Button>
                <Button
                    onClick={() => navigate(`/access/${id}`)}
                >Выдать доступ</Button>
                <Button>Статистика</Button>
            </Block>
        </div>
    )
}

export default Shop