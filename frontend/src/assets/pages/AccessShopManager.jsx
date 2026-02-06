import { useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import Manager from "../components/Manager/Manager"
import ManagerBlock from "../components/Manager/ManagerBlock"
import ManagerContent from "../components/Manager/ManagerContent"
import ManagerControlButton from "../components/Manager/ManagerControlButton"
import Block from "../components/Block/Block"
import BlockHeader from "../components/Block/BlockHeader"
import Readonly from "../components/Readonly/Readonly"
import NotificationsContext from "../components/Notifications/NotificationsContext"
import RestAPI from "../../RestAPI"


const AccessShopManager = () => {
    const {
        shop_id
    } = useParams()

    const {
        addNotification
    } = useContext(NotificationsContext)

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

    return (
        <Manager>

            <ManagerBlock>
                <Block>
                    <BlockHeader>Работники имеющие доступ</BlockHeader>
                    <ManagerContent>
                        {accessUsers.map(
                            (user) => <Readonly key={user.id}>{user.email}</Readonly>
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
                            (user) => <Readonly key={user.id}>{user.email}</Readonly>
                        )}
                    </ManagerContent>
                    <ManagerControlButton>Переместить</ManagerControlButton>
                </Block>
            </ManagerBlock>

        </Manager>
    )
}

export default AccessShopManager
