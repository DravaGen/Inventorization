import { useCallback, useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import Manager from "../components/Manager/Manager"
import ManagerBlock from "../components/Manager/ManagerBlock"
import ManagerItem from "../components/Manager/ManagerItem"
import ManagerContent from "../components/Manager/ManagerContent"
import ManagerControlButton from "../components/Manager/ManagerControlButton"
import Block from "../components/Block/Block"
import BlockHeader from "../components/Block/BlockHeader"
import AppContext from "../AppContext"
import RestAPI from "../../RestAPI"


const AccessShopManager = () => {
    const {
        shop_id
    } = useParams()

    const {
        addNotification
    } = useContext(AppContext)

    const [allUsers, setAllUsers] = useState([])
    const [accessUsers, setAccessUsers] = useState([])

    useEffect(() => {

        async function getAllUsers() {
            const response = await RestAPI.get_all_users()
            response.ok
                ? setAllUsers(response.data)
                : addNotification(response.message, response.type)
        }

        async function getAccessUsers() {
            const accessResponse = await RestAPI.get_access(shop_id)
            if (!accessResponse.ok) {
                addNotification(accessResponse.message, accessResponse.type)
                return
            }
            const userIds = accessResponse.data.user_ids
            const response = await RestAPI.get_users(userIds)
            response.ok
                ? setAccessUsers(response.data)
                : addNotification(response.message, response.type)
        }

        getAllUsers()
        getAccessUsers()
    }, [])

    const get_status_translate = useCallback((status) => {
        switch(status) {
            case "owner":
                return "Владелец"
            case "admin":
                return "Администратор"
            case "worker":
                return "Работник"
            default:
                return status
        }
    }, [])

    return (
        <Manager>

            <ManagerBlock>
                <Block>
                    <BlockHeader>Работники имеющие доступ</BlockHeader>
                    <ManagerContent>
                        {accessUsers.map(
                            (user) => (
                                <ManagerItem key={user.id} title={user.email}>
                                    <div>id: {user.id}</div>
                                    <div>Статус: {get_status_translate(user.status)}</div>
                                </ManagerItem>
                            )
                        )}
                    </ManagerContent>
                    <ManagerControlButton>Удалить</ManagerControlButton>
                </Block>
            </ManagerBlock>


            <ManagerBlock>
                <Block>
                    <BlockHeader>Работники </BlockHeader>
                    <ManagerContent>
                        {allUsers.map(
                            (user) => (
                                <ManagerItem key={user.id} title={user.email}>
                                    <div>id: {user.id}</div>
                                    <div>Статус: {get_status_translate(user.status)}</div>
                                </ManagerItem>
                            )
                        )}
                    </ManagerContent>
                    <ManagerControlButton>Переместить</ManagerControlButton>
                </Block>
            </ManagerBlock>

        </Manager>
    )
}

export default AccessShopManager
