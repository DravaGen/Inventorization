import { useState, useCallback, useEffect } from "react"
import { useParams } from "react-router-dom"

import { Block, BlockHeader } from "../components/Block"
import {
    Manager, ManagerBlock, ManagerContentItems
} from "../components/Manager"
import {
    StatsNavigator, StatsResult, StatsItems
} from "../components/Stats"
import RestAPI from "../../RestAPI"


const formatPrice = (price, round=0) => {
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: round,
        maximumFractionDigits: round
    }).format(price || 0) + ' ₽';
};


const StatsManager = () => {
    const { shop_id } = useParams()

    const [daySelect, setDaySelect] = useState(new Date().toISOString().split("T")[0])
    const [dataStats, setDataStats] = useState({
        date: daySelect,
        count: 0,
        total_profit: 0,
        total_sales: 0
    })
    const [itemsStats, setItemsStats] = useState([])

    const getDataStats = useCallback(async (date) => {
        setDataStats({date: date, count: 0, total_profit: 0, total_sales: 0})
        const [ok, response] = await RestAPI.getDataStats(shop_id, date)
        ok && setDataStats(response)
    }, [shop_id, setDataStats])

    const getItemDayStats = useCallback(async (date) => {
        setItemsStats([])
        const [ok, response] = await RestAPI.getItemDayStats(shop_id, date)
        ok && setItemsStats(response)
    }, [shop_id, setItemsStats])

    useEffect(() => {
        async function fetchData() {
            await getDataStats(daySelect)
            await getItemDayStats(daySelect)
        }
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [daySelect])

    return (
        <Manager>
            <ManagerBlock automaticHeight={true}>
                <Block>
                    <BlockHeader>Статистика продаж</BlockHeader>
                    <StatsNavigator
                        daySelect={daySelect}
                        setDaySelect={setDaySelect}
                    />
                    <StatsResult
                        shop_id={shop_id}
                        dataStats={dataStats}
                        formatPrice={formatPrice}
                    />
                    <StatsItems
                        items={itemsStats}
                        formatPrice={formatPrice}
                    />
                </Block>
            </ManagerBlock>
        </Manager>
    )
}

export default StatsManager