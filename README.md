
## Создание ключей для JWT

1. Переходим в директорию jwt
> cd backend/auth/jwt

2. Создаем приватный ключ
> openssl genrsa -out private.pem 2048

2. Создаем публичный ключ из приватного
> openssl rsa -in private.pem -outform PEM -pubout -out public.pem

## Аутентификация

Для входа в систему используйте следующий эндпоинт:

### POST /auth/login

**Важно:** В документации FastAPI (по адресу `/docs`) параметр для входа называется `username`, но на самом деле это поле ожидает ваш `email`. Пожалуйста, используйте его при выполнении запроса.