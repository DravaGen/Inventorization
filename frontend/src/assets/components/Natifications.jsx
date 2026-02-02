import Notification from "./Natification"

const Notifications = ({}) => {

    const notifications = [
        {text: "Неверный логин или пароль."},
        {text: "Невозможно добавить товар в магазин, так как данный товар не существует."},
        {text: "Прежде всего, дальнейшее развитие различных форм деятельности в значительной степени обусловливает важность направлений прогрессивного развития."},
    ]

    return (
        <div id="notifications">
            {notifications.map((data) => <Notification key={data.text} {...data} />)}
        </div>
    )
}

export default Notifications
