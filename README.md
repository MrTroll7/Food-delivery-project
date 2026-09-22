# 🍽️ Заказ еды из ресторана — Военмех .ЕДА
> **Курсовой проект по дисциплине «Введение в интернет-технологии»**  
> **Вариант №16** (Группа Б. Заказ и бронирование)

---

## 🌐 Ссылка на работающий проект (ПР 4)
- **URL приложения:** `http://localhost` (при запуске через Docker Compose) или `https://your-domain.com` (в продакшене)
- **Репозиторий:** `https://github.com/MrTroll7/Food-delivery-project`

---

## 🛠️ Технологический стек
- **Frontend:** HTML5 (семантическая разметка), CSS3 (Flexbox, Grid, Media Queries), Vanilla JavaScript (ES6+, Fetch API, DOM, localStorage).
- **Backend:** Python 3.11+, FastAPI, Pydantic, SQLAlchemy, Passlib / Bcrypt (хеширование паролей), PyJWT (авторизация по токенам).
- **База данных:** SQLite (3+ связанные таблицы, параметризованные SQL-запросы).
- **DevOps & Хостинг:** Docker, Docker Compose, Caddy (Reverse Proxy, автоматический HTTPS/SSL Let's Encrypt), VPS (Linux).

---

## 📄 Структура сайта и Страницы (ПР 1 & ПР 2)
1. **Главная (`index.html`):** 
2. **Каталог / Меню (`catalog.html`):** Полный перечень позиций, фильтрация по категориям без перезагрузки страницы.
3. **Страница блюда (`dish.html`):** Подробное описание, состав, характеристики.
4. **Оформление заказа (`checkout.html` — Страница действия):** Корзина (данные из localStorage), состав заказа, итоговая сумма, форма с полями получателя, адресом и временем доставки.
5. **Контакты (`contacts.html`):** Адрес, телефон, режим работы

### 🔌 Внешний API (ПР 2)
- **Использованный источник:** `https://dummyjson.com/recipes` 
- **Функционал:** Подгрузка данных о блюдах
- **Устойчивость:** Обработка ошибок сети (`try/catch` в JS-коде), отображение сообщения об ошибке при отключении интернета и индикация загрузки при запросах к серверу.

---

## 🗄️ Архитектура Базы Данных и API (ПР 3)

### Схема таблиц БД (SQLite)

1. **Таблица `users` (Пользователи):**
   - `id` (INTEGER, Primary Key)
   - `email` (VARCHAR, Unique)
   - `hashed_password` (VARCHAR) — *пароли хранятся исключительно в виде хеша!*
   - `name` (VARCHAR) — имя пользователя
   - `phone` (VARCHAR) — номер телефона

2. **Таблица `dishes` (Меню/Блюда):**
   - `id` (INTEGER, Primary Key)
   - `title` (VARCHAR) — название блюда
   - `price` (FLOAT / INT) — цена
   - `category` (VARCHAR) — категория кухни
   - `image` (VARCHAR) — путь к изображению
   - `description` (VARCHAR) — описание блюда
   - `caloriesPerServing` (INTEGER) — калории на порцию — *содержит не менее 15 записей*.

3. **Таблица `orders` (Заказы — Связующая таблица):**
   - `id` (INTEGER, Primary Key)
   - `address` (VARCHAR) — адрес доставки
   - `created_at` (VARCHAR) — дата создания
   - `status` (VARCHAR) — *статус приготовления/доставки ("в процессе", "Готовится", "В пути")*
   - `user_id` (INTEGER, Foreign Key -> `users.id`)

4. **Таблица `order_items` (Позиции заказа):**
   - `id` (INTEGER, Primary Key)
   - `order_id` (INTEGER, Foreign Key -> `orders.id`)
   - `dish_id` (INTEGER, Foreign Key -> `dishes.id`)
   - `quantity` (INTEGER) — количество
   - `price_at_order` (FLOAT) — цена на момент покупки

### Основные Эндпоинты API (FastAPI)
- `GET /api/dishes` — Получение списка блюд с фильтрацией по категории.
- `GET /api/dishes/{id}` — Получение информации о конкретном блюде.
- `POST /api/auth/register` — Регистрация нового пользователя.
- `POST /api/auth/login` — Вход и получение JWT-токена.
- `POST /api/orders` — Создание нового заказа (для авторизованных пользователей).
- `GET /api/orders/my` — Просмотр личных заказов и их статусов (доступно через эндпоинт `GET /api/orders` с авторизацией).

---

## 🚀 Инструкция по локальному запуску и деплою (ПР 4)

### Инициализация БД 
```bash
python init.py
```
Инициализирует БД данными с внешнего API, используемого в ПР2

### Запуск через Docker Compose (Основной способ)
```bash
# 1. Клонировать репозиторий
git clone <repository_url>
cd <repository_folder>

# 2. Собрать и запустить контейнеры в фоновом режиме
docker compose up -d --build

# Приложение будет доступно по адресу: http://localhost (или https://ваш-домен через Caddy)