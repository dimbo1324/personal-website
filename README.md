# Telegram Bot

Telegram чат-бот на Python.

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

## Запуск

```bash
source .venv/bin/activate
python src/bot.py
```

## Тестирование

```bash
source .venv/bin/activate
pytest tests/
```

## Структура проекта

```
.
├── src/
│   ├── __init__.py
│   ├── bot.py          # Основной файл бота
│   ├── config.py       # Конфигурация
│   └── handlers/       # Обработчики команд
│       └── __init__.py
├── tests/
│   ├── __init__.py
│   └── test_bot.py     # Тесты
├── .env.example        # Пример переменных окружения
├── .gitignore
├── requirements.txt    # Зависимости
└── README.md
```

## Лицензия

MIT
