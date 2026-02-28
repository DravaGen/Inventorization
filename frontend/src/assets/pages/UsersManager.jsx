import {
    useCallback, useContext, useEffect,
    useRef, useState
} from "react"
import { useParams } from "react-router-dom"

import {
    Manager, ManagerBlock, ManagerItemUser,
    ManagerContent, ManagerControlButton,
    getActivatedCheckbox, getElementUUID
} from "../components/Manager"

import { Block, BlockHeader} from "../components/Block"
import { AddUser } from "../components/Add"
import AppContext from "../AppContext"
import RestAPI from "../../RestAPI"


const UsersManager = () => {
    const {
        shop_id
    } = useParams()

    const {
        addNotification
    } = useContext(AppContext)

    const [accessUsers, setAccessUsers] = useState([])
    const [otherUsers, setOtherUsers] = useState([])

    const accessBlock = useRef(null)
    const otherBlock = useRef(null)

    const getAccessUsers = useCallback(async (shop_id) => {
        let [okAccess, access] = await RestAPI.getAccess(shop_id)
        const userIds = okAccess ? access.user_ids : []
        if (userIds.length == 0) return []

        let [okUsersData, usersData] = await RestAPI.getUsers(userIds)
        return okUsersData ? usersData : []
    }, [])

    const filterOtherUsers = useCallback((allUsers, accessUsers) => {
        const accessUserIds = accessUsers.map(user => user.id)
        return allUsers.filter((user) => !accessUserIds.includes(user.id))
    }, [])

    const getOtherUsers = useCallback(async (shop_id) => {
        const accessUsers = await getAccessUsers(shop_id)
        const [ok, response] = await RestAPI.getAllUsers()
        const allUsers = ok ? response : []
        return filterOtherUsers(allUsers, accessUsers)
    }, [getAccessUsers, filterOtherUsers])

    const initBlocksData = useCallback(async () => {
        setAccessUsers(await getAccessUsers(shop_id))
        setOtherUsers(await getOtherUsers(shop_id))
    }, [shop_id, getAccessUsers, getOtherUsers])

    useEffect(() => {
        async function fetchData() {
            await initBlocksData()
        }
        fetchData()
    }, [initBlocksData])

    const logicDeleteAceess = useCallback(async () => {
        const checkboxes = getActivatedCheckbox(accessBlock)

        if (checkboxes.length == 0) {
            addNotification("Не выбран ни один элемент", "warning")
            return;
        }

        for (const checkbox of checkboxes) {
            const userId = getElementUUID(checkbox)
            await RestAPI.deleteAccess(userId, shop_id)
        }

        initBlocksData()
    }, [
        shop_id, addNotification, accessBlock, initBlocksData
    ])

    const logicGrantAccess = useCallback(async () => {
        const checkboxes = getActivatedCheckbox(otherBlock)

        if (checkboxes.length == 0) {
            addNotification("Не выбран ни один элемент", "warning")
            return;
        }

        for (const checkbox of checkboxes) {
            const userId = getElementUUID(checkbox)
            await RestAPI.grantAccess(userId, shop_id)
        }

        initBlocksData()
    }, [
        shop_id, addNotification, otherBlock, initBlocksData
    ])


    return (
        <Manager>

            <ManagerBlock ref={accessBlock}>
                <Block>
                    <BlockHeader>Работники имеющие доступ</BlockHeader>
                    <ManagerContent>
                        {accessUsers.map(
                            (user) => <ManagerItemUser
                                key={user.id}
                                user={user}
                        />)}
                    </ManagerContent>
                    <ManagerControlButton
                        onClick={logicDeleteAceess}
                    >Отозвать доступ</ManagerControlButton>
                </Block>
            </ManagerBlock>


            <ManagerBlock ref={otherBlock}>
                <Block>
                    <BlockHeader>Работники</BlockHeader>
                    <AddUser initBlocksData={initBlocksData} />
                    <ManagerContent>
                        {otherUsers.map(
                            (user) => <ManagerItemUser
                                key={user.id}
                                user={user}
                        />)}
                    </ManagerContent>
                    <ManagerControlButton
                        onClick={logicGrantAccess}
                    >Выдать доступ</ManagerControlButton>
                </Block>
            </ManagerBlock>

        </Manager>
    )
}


export default UsersManager
