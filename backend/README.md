# Бэкенд WebLarek.

## Используемые технологии и решения

- Typescript в качестве основного языка проекта
- Mongodb и ODM Mongoose для хранения данных пользователей
- Node.js в качестве среды выполнения

Перед отправкой работы на проверку убедитесь что она соответствует требованиям проектной работы

## Авторизация

Для работы маршрутов `/auth` задайте в `.env` два разных случайных секрета:
`AUTH_ACCESS_TOKEN_SECRET` и `AUTH_REFRESH_TOKEN_SECRET`. Время жизни задают
`AUTH_ACCESS_TOKEN_EXPIRY` (10 минут) и `AUTH_REFRESH_TOKEN_EXPIRY` (7 дней).
Значения перечислены в `.env.example`; пустые секреты сервер не принимает.

Refresh-токен передаётся в cookie `refreshToken` с флагом HttpOnly, а access-токен —
в поле `accessToken` ответа. Для `/auth/user` передавайте заголовок
`Authorization: Bearer <accessToken>`.
