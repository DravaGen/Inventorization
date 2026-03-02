import { useNavigate } from "react-router-dom"

import { Block, BlockHeader} from "../Block"
import { Button } from "../Button"
import { UserStatus, checkUserMinStatus } from "../../../RestAPI"


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
                {
                    checkUserMinStatus(UserStatus.OWNER)
                    && <Button className={"edit-button"}>Изменить</Button>
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
                {
                    checkUserMinStatus(UserStatus.ADMIN)
                    && <Button>Принять товар</Button>
                }
                {
                    checkUserMinStatus(UserStatus.OWNER)
                    && <Button
                        onClick={() => navigate(`/access/${id}`)}
                    >Выдать доступ</Button>
                }
                {
                    checkUserMinStatus(UserStatus.OWNER)
                    && <Button>Статистика</Button>
                }
            </Block>
        </div>
    )
}


export default Shop
