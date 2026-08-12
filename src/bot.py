"""Main bot module."""

import logging
from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

from src.config import get_config

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /start command."""
    await update.message.reply_text(
        "Привет! Я Telegram бот. Отправьте мне сообщение, и я отвечу."
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /help command."""
    await update.message.reply_text(
        "Доступные команды:\n"
        "/start - Запустить бота\n"
        "/help - Показать справку\n"
        "/about - О боте"
    )


async def about_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /about command."""
    await update.message.reply_text(
        "Я Telegram чат-бот, разработанный на Python с использованием библиотеки python-telegram-bot."
    )


async def echo_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Echo received messages."""
    if update.message and update.message.text:
        await update.message.reply_text(f"Вы сказали: {update.message.text}")


async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle errors."""
    logger.error(f"Update {update} caused error {context.error}")


def create_application() -> Application:
    """Create and configure the bot application."""
    config = get_config()

    if not config.telegram_bot_token:
        logger.warning("TELEGRAM_BOT_TOKEN не установлен. Бот не сможет подключиться.")

    application = (
        Application.builder().token(config.telegram_bot_token).build()
    )

    # Add handlers
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("about", about_command))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo_message))

    # Add error handler
    application.add_error_handler(error_handler)

    return application


async def main() -> None:
    """Run the bot."""
    config = get_config()
    application = create_application()

    logger.info("Запуск бота...")
    await application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
