

const StatsResult = ({ dataStats, formatPrice }) => {

    const { total_profit, total_sales, count } = dataStats

    const profitClass =
        total_profit > 0 ? "positive" :
        total_profit < 0 ? "negative" :
        ""

    const avgCheck = count ? total_sales / count : 0
    const avgProfit = count ? total_profit / count : 0

    return (
        <div className="stats-result">
            <div>Продажи за день</div>

            <div className={`stats-total-sales ${total_sales > 0 ? "positive" : ""}`}>
                {formatPrice(total_sales)}
            </div>

            <div className={`stats-profit ${profitClass}`}>
                {formatPrice(total_profit)}
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
