

const StatsItemRow = ({ item, index, totalSales, formatPrice }) => {

    const color = `hsl(${(index * 37) % 360}, 70%, 60%)`

    const profitClass =
        item.profit > 0 ? "positive" :
        item.profit < 0 ? "negative" :
        ""

    const share = totalSales
        ? ((item.sales / totalSales) * 100).toFixed(1)
        : 0

    return (
        <div className="stats-item-row">

            <div className="stats-item-info">
                <span
                    className="stats-item-dot"
                    style={{ backgroundColor: color }}
                />
                <div>
                    <div className="stats-item-name">{item.name}</div>
                    <div className="stats-item-sold">Продано: {item.sold} шт • {share}%</div>
                    <div className="stats-item-bar">
                        <div
                            className="stats-item-bar-fill"
                            style={{
                                width: `${share}%`,
                                background: color
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="stats-item-prices">
                <div className="stats-item-sales">{formatPrice(item.sales)}</div>
                <div className={`stats-item-profit ${profitClass}`}>
                    {item.profit > 0 ? "+" : ""}
                    {formatPrice(item.profit)}
                </div>
                <div className="stats-item-avg">
                    {formatPrice(item.avg_price)} / шт
                </div>
            </div>

        </div>
    )
}


export default StatsItemRow
