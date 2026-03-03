import { useCallback, useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import {
    Manager, ManagerBlock, ManagerItemUser,
    ManagerContentItems, ManagerControlButton,
    getElementUUID
} from "../components/Manager"

import { Block, BlockHeader} from "../components/Block"
import { AddUser } from "../components/Add"
import RestAPI from "../../RestAPI"


const UsersManager = () => {
    const {
        shop_id
    } = useParams()

    const [accessUsers, setAccessUsers] = useState([])
    const [otherUsers, setOtherUsers] = useState([])

    const [accessSelected, setAccessSelected] = useState([])
    const [otherSelected, setOtherSelected] = useState([])

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

        for (const element of accessSelected) {
            const itemsManagerHTML = element.ref.current
            const userId = getElementUUID(itemsManagerHTML)
            const [ok, ] = await RestAPI.deleteAccess(userId, shop_id)
            ok && itemsManagerHTML.removeChecked()
        }

        initBlocksData()
    }, [shop_id, accessSelected, initBlocksData])

    const logicGrantAccess = useCallback(async () => {

        for (const element of otherSelected) {
            const itemsManagerHTML = element.ref.current
            const userId = getElementUUID(itemsManagerHTML)
            const [ok, ] = await RestAPI.grantAccess(userId, shop_id)
            ok && itemsManagerHTML.removeChecked()
        }

        initBlocksData()
    }, [shop_id, otherSelected, initBlocksData])


    return (
        <Manager>

            <ManagerBlock>
                <Block>
                    <BlockHeader>Работники имеющие доступ</BlockHeader>
                    <ManagerContentItems
                        elements={accessUsers}
                        elementName={"user"}
                        Component={ManagerItemUser}
                        setSelectedList={setAccessSelected}
                        useSearchInput={() => [true, "email"]}
                        canSelected={true}
                    />
                    <ManagerControlButton
                        disabled={!accessSelected.length}
                        onClick={logicDeleteAceess}
                    >Отозвать доступ</ManagerControlButton>
                </Block>
            </ManagerBlock>


            <ManagerBlock>
                <Block>
                    <BlockHeader>Работники</BlockHeader>
                    <AddUser initBlocksData={initBlocksData} />
                    <ManagerContentItems
                        elements={otherUsers}
                        elementName={"user"}
                        Component={ManagerItemUser}
                        setSelectedList={setOtherSelected}
                        useSearchInput={() => [true, "email"]}
                        canSelected={true}
                    />
                    <ManagerControlButton
                        disabled={!otherSelected.length}
                        onClick={logicGrantAccess}
                    >Выдать доступ</ManagerControlButton>
                </Block>
            </ManagerBlock>

        </Manager>
    )
}


export default UsersManager
