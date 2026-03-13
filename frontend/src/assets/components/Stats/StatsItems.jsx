import StatsItem from "./StatsItem"

const StatsItems = ({ items = [], formatPrice }) => {

    if (!items.length) {
        return (
            <div>
                <h3 className="stats-items-title">Товары</h3>
                <div className="stats-item-empty">
                    Нет продаж за этот день
                </div>
            </div>
        )
    }

    const totalSales = items.reduce((sum, i) => sum + i.sales, 0)
    const sortedItems = [...items].sort((a, b) => b.sales - a.sales)

    return (
        <div>
            <h3 className="stats-items-title">Товары</h3>
            <div className="stats-items-list">
                {sortedItems.map((item, index) => (
                    <StatsItem
                        key={item.item_id}
                        item={item}
                        index={index}
                        totalSales={totalSales}
                        formatPrice={formatPrice}
                    />
                ))}
            </div>
        </div>
    )
}


export default StatsItems
