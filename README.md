# Telegram Bot

Асинхронный Telegram-бот для напоминаний с мотивирующими цитатами и автоочисткой переписки.

## Требования

- Python 3.12+ (рекомендуется 3.14)
- virtualenv

## Установка

```bash
# Создание виртуального окружения
python3 -m venv .venv

# Активация виртуального окружения
source .venv/bin/activate  # Linux/macOS
# или
.venv\Scripts\activate  # Windows

# Установка зависимостей
pip install -r requirements.txt
```

## Настройка

Скопируйте файл `.env.example` в `.env` и заполните необходимые переменные:

```bash
cp .env.example .env
```

Необходимые переменные окружения:
- `TELEGRAM_BOT_TOKEN` - токен вашего бота от @BotFather
- `ADMIN_USER_IDS` - ID администраторов бота (через запятую), например: `123456789,987654321`
- `DATABASE_URL` - строка подключения к БД (по умолчанию SQLite)
- `SCHEDULER_JOBSTORE_URL` - строка подключения для планировщика задач APScheduler

Получить токен бота можно у [@BotFather](https://t.me/BotFather).

## Запуск

```bash
source .venv/bin/activate
python -m bot.main
```

## Тестирование

```bash
source .venv/bin/activate
pytest tests/ -v --cov=bot --cov-report=term-missing
```

## Структура проекта

```
.
├── bot/
│   ├── __init__.py
│   ├── main.py                     # Точка входа, сборка приложения
│   ├── config/
│   │   └── __init__.py             # Settings (pydantic-settings)
│   ├── database/
│   │   ├── __init__.py
│   │   ├── models.py               # SQLAlchemy модели
│   │   └── repository.py           # Доступ к данным
│   ├── services/
│   │   ├── __init__.py
│   │   ├── reminder_service.py     # Логика напоминаний
│   │   ├── quote_service.py        # Логика цитат
│   │   ├── notification_service.py # Отправка сообщений
│   │   ├── cleanup_service.py      # Автоочистка переписки
│   │   └── scheduler_service.py    # Планировщик APScheduler
│   ├── handlers/
│   │   ├── __init__.py
│   │   ├── start.py
│   │   ├── help.py
│   │   ├── reminders.py
│   │   ├── quotes.py
│   │   ├── settings.py
│   │   └── errors.py               # Обработчик ошибок
│   └── utils/
│       ├── __init__.py
│       ├── scheduling.py           # Расчёт времени напоминаний
│       ├── validators.py           # Валидация данных
│       └── formatting.py           # Форматирование и экранирование
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   └── ...                         # Тесты
├── alembic/                        # Миграции БД
├── alembic.ini
├── .env.example
├── .gitignore
├── pytest.ini
├── requirements.txt
└── README.md
```

## Команды бота

### Напоминания
- `/create` - Создать новое напоминание (пошаговый диалог)
- `/my_reminders` - Показать все напоминания
- `/delete <ID>` - Удалить напоминание по ID
- `/pause <ID>` - Приостановить напоминание
- `/resume <ID>` - Возобновить напоминание

### Цитаты
- `/quote [категория]` - Получить случайную цитату
- `/categories` - Список доступных категорий
- `/addquote <текст> | <автор> | <категория>` - Добавить цитату (только админ)
- `/deletequote <ID>` - Удалить цитату (только админ)

### Настройки
- `/settings` - Показать настройки
- `/timezone <IANA-таймзона>` - Установить часовой пояс (например, `Europe/Moscow`)
- `/toggle_quotes` - Вкл/выкл цитаты в напоминаниях
- `/cleanup <дни>` - Настроить период автоочистки (7, 14, 30, 60, 90 или off)

### Общие
- `/start` - Приветствие
- `/help` - Справка
- `/about` - О боте

## Важное ограничение автоочистки

Telegram Bot API позволяет ботам удалять **только свои собственные сообщения** и **только те, что не старше 48 часов**. 

Это означает:
- Бот может удалить свои сообщения, отправленные менее 48 часов назад
- Сообщения старше 48 часов невозможно удалить через API — они останутся в чате
- Бот не может удалять сообщения пользователя

Автоочистка работает так: раз в сутки проверяются сообщения, которые старше периода очистки (например, 30 дней), но ещё не старше 48 часов с момента отправки. Такие сообщения удаляются. Более старые записи просто очищаются из локальной базы данных бота.

## Миграции базы данных

Для управления миграциями БД используется Alembic:

```bash
# Инициализация Alembic (если ещё не инициализирован)
alembic init alembic

# Создать новую миграцию
alembic revision --autogenerate -m "Описание изменений"

# Применить миграции
alembic upgrade head

# Откатить на одну миграцию назад
alembic downgrade -1
```

## Лицензия

MIT
