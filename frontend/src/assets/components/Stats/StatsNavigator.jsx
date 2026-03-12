import { useCallback } from "react"
import { Button } from "../Button"


const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'long', year: "numeric"
    })
}


const StatsNavigator = ({ daySelect, setDaySelect }) => {

    const goToPreviousDay = useCallback(() => {
        const date = new Date(daySelect)
        date.setDate(date.getDate() - 1)

        const minDate = new Date('1970-01-01')
        const currentDate = new Date(date.toISOString().split('T')[0])

        if (currentDate >= minDate) {
            setDaySelect(date.toISOString().split('T')[0])
        }
    }, [daySelect, setDaySelect])

    const goToToday = useCallback(() => {
        setDaySelect(new Date().toISOString().split('T')[0])
    }, [setDaySelect])

    const goToNextDay = useCallback(() => {
        const date = new Date(daySelect)
        date.setDate(date.getDate() + 1)
        const today = new Date().toISOString().split('T')[0]

        if (date.toISOString().split('T')[0] <= today) {
            setDaySelect(date.toISOString().split('T')[0])
        }
    }, [daySelect, setDaySelect])

    return (
        <div className="stats-navigator">
            <Button
                onClick={goToPreviousDay}
            >←</Button>
            <div
                className="stats-navigator-day"
                onClick={goToToday}
            >{formatDate(daySelect)}</div>
            <Button
                onClick={goToNextDay}
                disabled={daySelect >= new Date().toISOString().split('T')[0]}
            >→</Button>
        </div>
    )
}


export default StatsNavigator
