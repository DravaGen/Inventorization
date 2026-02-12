import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"

import Manager from "../components/Manager/Manager"
import ManagerBlock from "../components/Manager/ManagerBlock"
import ManagerItemUser from "../components/Manager/ManagerItemUser"
import ManagerContent from "../components/Manager/ManagerContent"
import ManagerControlButton from "../components/Manager/ManagerControlButton"
import Block from "../components/Block/Block"
import BlockHeader from "../components/Block/BlockHeader"
import AddUser from "../components/AddUser/AddUser"
import AppContext from "../AppContext"
import RestAPI from "../../RestAPI"


const AccessShopManager = () => {
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
        let [ok_access, access] = await RestAPI.get_access(shop_id)
        const user_ids = ok_access ? access.user_ids : []
        if (user_ids.length == 0) return []

        let [ok_users_data, users_data] = await RestAPI.get_users(user_ids)
        return ok_users_data ? users_data : []
    }, [])

    const filterOtherUsers = useCallback((all_users, access_users) => {
        const access_user_ids = access_users.map(user => user.id)
        return all_users.filter((user) => !access_user_ids.includes(user.id))
    }, [])

    const getOtherUsers = useCallback(async (shop_id) => {
        const access_users = await getAccessUsers(shop_id)
        const [ok, response] = await RestAPI.get_all_users()
        const all_users = ok ? response : []
        return filterOtherUsers(all_users, access_users)
    }, [])

    const initBlocksData = useCallback(async () => {
        setAccessUsers(await getAccessUsers(shop_id))
        setOtherUsers(await getOtherUsers(shop_id))
    }, [])

    useEffect(() => {
        initBlocksData()
    }, [])

    const getActivatedCheckbox = useCallback((block) => {
        return Array.from(
            block.current
                ? block.current.querySelectorAll('input[type="checkbox"]')
                : []
        ).filter(cb => cb.checked)
    }, [])

    const getElementUUID = useCallback((element) => {
        const row = element.closest('.manager-item-row')
        const id_div = row.querySelector('.manager-item-body > div:first-child')
        return id_div.textContent.replace('id: ', '').trim()
    }, [])

    const logicDeleteAceess = useCallback(async () => {
        const checkboxes = getActivatedCheckbox(accessBlock)

        if (checkboxes.length == 0) {
            addNotification("Не выбран ни один элемент", "warning")
            return;
        }

        for (const checkbox of checkboxes) {
            const user_id = getElementUUID(checkbox)
            await RestAPI.delete_access(user_id, shop_id)
        }

        initBlocksData()
    }, [])

    const logicGrantAccess = useCallback(async () => {
        const checkboxes = getActivatedCheckbox(otherBlock)

        if (checkboxes.length == 0) {
            addNotification("Не выбран ни один элемент", "warning")
            return;
        }

        for (const checkbox of checkboxes) {
            const user_id = getElementUUID(checkbox)
            await RestAPI.grant_access(user_id, shop_id)
        }

        initBlocksData()
    }, [])


    return (
        <Manager>

            <ManagerBlock ref={accessBlock}>
                <Block>
                    <BlockHeader>Работники имеющие доступ</BlockHeader>
                    <ManagerContent>
                        {accessUsers.map((user) => <ManagerItemUser key={user.id} user={user} />)}
                    </ManagerContent>
                    <ManagerControlButton
                        onClick={async () => {logicDeleteAceess()}}
                    >Удалить</ManagerControlButton>
                </Block>
            </ManagerBlock>


            <ManagerBlock ref={otherBlock}>
                <Block>
                    <BlockHeader>Работники</BlockHeader>
                    <ManagerContent>
                        <AddUser initBlocksData={initBlocksData} />
                        {otherUsers.map((user) => <ManagerItemUser key={user.id} user={user} />)}
                    </ManagerContent>
                    <ManagerControlButton
                        onClick={async () => {logicGrantAccess()}}
                    >Переместить</ManagerControlButton>
                </Block>
            </ManagerBlock>

        </Manager>
    )
}

export default AccessShopManager
