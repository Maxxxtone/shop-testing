# E-commerce API

Учебный REST API интернет-магазина на Node.js + PostgreSQL. Проект создан для отработки тестирования API в Postman: коллекции, переменные, окружения, автотесты, Collection Runner, DDT, Mock, Newman.

### 1. Требования

Проверьте, что установлены:

```bash
node -v          # v18+
npm -v           # 9+
psql --version   # PostgreSQL 14+
```

Postman — desktop-приложение, последняя версия: https://www.postman.com/downloads/

### 2. Установка зависимостей

```bash
npm install
```

### 3. Создание базы данных

Подключитесь к PostgreSQL:

```bash
psql -U postgres
```

> Если получаете `role "postgres" does not exist` — суперпользователь у вас называется иначе (например, ваше системное имя). Используйте `psql -U <ваше_имя> -d postgres` и это же имя укажите в `.env` ниже.

```bash
CREATE DATABASE ecommerce_api;
```
Примените схему:

```bash
psql -U postgres -d ecommerce_api -f db.sql
```

### 4. Настройка `.env`

Скопируйте шаблон:

```bash
cp .env.example .env          # macOS/Linux
copy .env.example .env        # Windows
```

Откройте `.env` и заполните:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=ваш_пароль_от_postgres
DB_NAME=ecommerce_api
JWT_SECRET=любая-длинная-случайная-строка
```

- `DB_PASSWORD` — пароль пользователя PostgreSQL.
- `JWT_SECRET` — произвольная строка (например, `my-super-secret-2025`). Без него сервер не запустится.

### 5. Заполнение БД тестовыми данными

```bash
npm run seed
```

### 6. Запуск сервера

```bash
npm start
```

Ожидаемый вывод:

```
Server: http://localhost:3000
Swagger: http://localhost:3000/api-docs
```

Терминал не закрывайте. Для остановки — `Ctrl+C`.

## Тестовые пользователи

| Email | Пароль | Роль |
|---|---|---|
| `admin@shop.local` | `admin123` | admin |
| `alice@test.com` | `alice123` | customer |
| `bob@test.com` | `bob123` | customer |


## Эндпоинты

Базовый префикс: `/api`. Полная спецификация — в `swagger.yaml` и на `/api-docs`.


## Лицензия

Учебный проект. Свободно используется в образовательных целях.
