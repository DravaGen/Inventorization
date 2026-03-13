import { useState, useEffect } from "react"
import RestAPI from "../../../RestAPI"

const getSignClass = (value) =>
    value > 0 ? "positive" : value < 0 ? "negative" : ""

const StatsResult = ({ shop_id, dataStats, formatPrice }) => {

    const { total_profit, total_sales, count, date } = dataStats
    const [profitChange, setProfitChange] = useState({ diff: 0, percent: 0 })

    const profitClass = getSignClass(total_profit)
    const changeClass = getSignClass(profitChange.diff)

    const avgCheck = count > 0 ? total_sales / count : 0
    const avgProfit = count > 0 ? total_profit / count : 0

    useEffect(() => {
        const loadYesterday = async () => {
            const yesterday = new Date(date)
            yesterday.setDate(yesterday.getDate() - 1)

            const [ok, response] = await RestAPI.getDataStats(
                shop_id,
                yesterday.toISOString().split("T")[0]
            )

            const yesterdayProfit = ok ? response.total_profit : 0
            const todayProfit = total_profit || 0

            const diff = todayProfit - yesterdayProfit

            const percent =
                yesterdayProfit !== 0
                    ? ((diff / yesterdayProfit) * 100).toFixed(1)
                    : todayProfit > 0 ? 100 : 0

            setProfitChange({ diff, percent })
        }

        loadYesterday()
    }, [shop_id, date, total_profit])


    return (
        <div className="stats-result">
            <span>Продажи за день</span>

            <div className={`stats-total-sales ${total_sales > 0 ? "positive" : ""}`}>
                {formatPrice(total_sales)}
            </div>

            <div className="stats-profit-block">
                <div className={`stats-profit ${profitClass}`}>
                    {formatPrice(total_profit)}
                </div>
                {profitChange.diff !== 0 && (
                    <span className={`stats-change-badge ${changeClass}`}>
                        {profitChange.diff > 0 ? "▲" : "▼"}
                        {formatPrice(Math.abs(profitChange.diff))}
                        <span className="stats-change-percent">
                            ({profitChange.diff > 0 ? "+" : ""}
                            {profitChange.percent}%)
                        </span>
                    </span>
                )}
            </div>

            <div className="stats-result-other">
                <div className="stats-metric">
                    <span className="stats-metric-label">Продано</span>
                    <span className="stats-metric-value">{count} шт</span>
                </div>

                <div className="stats-metric">
                    <span className="stats-metric-label">Средний чек</span>
                    <span className="stats-metric-value">
                        {formatPrice(avgCheck, 2)}
                    </span>
                </div>

                <div className="stats-metric">
                    <span className="stats-metric-label">Средняя прибыль</span>
                    <span className="stats-metric-value">
                        {formatPrice(avgProfit, 2)}
                    </span>
                </div>
            </div>
        </div>
    )
}


export default StatsResult
