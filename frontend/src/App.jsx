import "./App.css"

const App = () => {
  return (
    <div id="login-block">
      <div className="block">

        <label>Inventorization</label>
        <div id="login-form">
          <input
            type="text"
            placeholder="Введите email"
          />
          <div className="inline-group">
            <input
              type="text"
              placeholder="Код"
            />
            <button>Отправить</button>

          </div>
          <button>Войти</button>
        </div>

      </div>
    </div>
  )
}

export default App
