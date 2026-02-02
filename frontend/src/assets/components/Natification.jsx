import Button from "./Button"


const Notification = ({text, duration}) => {
    return (
        <div className="notification">
            <div className="notification-content">{text}</div>
            <Button className="notification-close">Скрыть</Button>
        </div>
    )
}

export default Notification
