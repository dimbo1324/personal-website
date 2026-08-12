"""
Модуль бота.
Инициализация, настройка и запуск Telegram бота.
"""
import logging
from telegram import Bot
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    ConversationHandler,
)

from bot.config import Settings, get_settings
from bot.database.repository import Database
from bot.services.reminder_service import ReminderService
from bot.services.quote_service import QuoteService
from bot.services.notification_service import NotificationService
from bot.services.cleanup_service import CleanupService
from bot.handlers.start import StartHandler
from bot.handlers.help import HelpHandler
from bot.handlers.reminders import RemindersHandler, CREATE_TITLE, CREATE_DESCRIPTION, CREATE_FREQUENCY, CREATE_TIMES
from bot.handlers.quotes import QuotesHandler
from bot.handlers.settings import SettingsHandler

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)


class ReminderBot:
    """Класс Telegram бота для напоминаний."""
    
    def __init__(self, settings: Settings = None):
        self.settings = settings or get_settings()
        self.db = None
        self.bot = None
        self.application = None
        
        # Сервисы
        self.reminder_service = None
        self.quote_service = None
        self.notification_service = None
        self.cleanup_service = None
        
        # Обработчики
        self.start_handler = None
        self.help_handler = None
        self.reminders_handler = None
        self.quotes_handler = None
        self.settings_handler = None
    
    async def initialize(self) -> None:
        """Инициализировать бота и все компоненты."""
        logger.info("Инициализация бота...")
        
        # Инициализация базы данных
        self.db = Database(self.settings.database_url)
        await self.db.init_db()
        logger.info("База данных инициализирована")
        
        # Инициализация Telegram бота
        self.bot = Bot(token=self.settings.telegram_bot_token)
        
        # Инициализация сервисов
        self.reminder_service = ReminderService(self.db)
        self.quote_service = QuoteService(self.db)
        self.notification_service = NotificationService(self.bot, self.db)
        self.cleanup_service = CleanupService(self.bot, self.db)
        
        # Инициализация обработчиков
        self.start_handler = StartHandler(self.db, self.notification_service)
        self.help_handler = HelpHandler(self.notification_service)
        self.reminders_handler = RemindersHandler(
            self.db, self.reminder_service, self.notification_service
        )
        self.quotes_handler = QuotesHandler(
            self.db, self.quote_service, self.notification_service
        )
        self.settings_handler = SettingsHandler(self.db, self.notification_service)
        
        # Инициализация цитат по умолчанию
        await self.quote_service.initialize_default_quotes()
        
        # Создание приложения
        self.application = Application.builder().token(self.settings.telegram_bot_token).build()
        
        # Регистрация обработчиков
        self._register_handlers()
        
        logger.info("Бот успешно инициализирован")
    
    def _register_handlers(self) -> None:
        """Зарегистрировать все обработчики команд."""
        
        # Команда /start
        self.application.add_handler(
            CommandHandler("start", self.start_handler.handle)
        )
        
        # Команда /help
        self.application.add_handler(
            CommandHandler("help", self.help_handler.handle)
        )
        
        # Создание напоминания (ConversationHandler)
        conv_handler = ConversationHandler(
            entry_points=[CommandHandler("create", self.reminders_handler.start_create)],
            states={
                CREATE_TITLE: [
                    CommandHandler("cancel", self._cancel_conversation),
                    # Любой текстовый сообщение
                ],
                CREATE_DESCRIPTION: [
                    CommandHandler("skip", self.reminders_handler.receive_description),
                    CommandHandler("cancel", self._cancel_conversation),
                ],
                CREATE_FREQUENCY: [
                    CallbackQueryHandler(self.reminders_handler.receive_frequency),
                ],
                CREATE_TIMES: [
                    CommandHandler("skip", self.reminders_handler.receive_times),
                    CommandHandler("cancel", self._cancel_conversation),
                ],
            },
            fallbacks=[CommandHandler("cancel", self._cancel_conversation)],
        )
        self.application.add_handler(conv_handler)
        
        # Список напоминаний
        self.application.add_handler(
            CommandHandler("my_reminders", self.reminders_handler.list_reminders)
        )
        
        # Удаление напоминания
        self.application.add_handler(
            CommandHandler("delete", self.reminders_handler.delete_reminder)
        )
        
        # Цитата
        self.application.add_handler(
            CommandHandler("quote", self.quotes_handler.send_random_quote)
        )
        
        # Добавить цитату
        self.application.add_handler(
            CommandHandler("addquote", self.quotes_handler.add_quote)
        )
        
        # Категории цитат
        self.application.add_handler(
            CommandHandler("categories", self.quotes_handler.list_categories)
        )
        
        # Настройки
        self.application.add_handler(
            CommandHandler("settings", self.settings_handler.show_settings)
        )
        
        # Переключить цитаты
        self.application.add_handler(
            CommandHandler("quotes", self.settings_handler.toggle_quotes)
        )
        
        # Настроить очистку
        self.application.add_handler(
            CommandHandler("cleanup", self.settings_handler.set_cleanup_period)
        )
        
        # Часовой пояс
        self.application.add_handler(
            CommandHandler("timezone", self.settings_handler.set_timezone)
        )
        
        # Обработка callback queries (для inline кнопок)
        self.application.add_handler(
            CallbackQueryHandler(self.reminders_handler.receive_frequency)
        )
    
    async def _cancel_conversation(
        self, update, context
    ) -> None:
        """Отменить текущий диалог."""
        context.user_data.clear()
        await update.message.reply_text("❌ Операция отменена.")
        return ConversationHandler.END
    
    async def start(self) -> None:
        """Запустить бота."""
        if not self.application:
            await self.initialize()
        
        logger.info("Запуск бота...")
        
        # Запускаем polling
        await self.application.initialize()
        await self.application.start()
        await self.application.updater.start_polling(allowed_updates=Update.ALL_TYPES)
        
        logger.info("Бот запущен и ожидает сообщения...")
        
        # Держим бота запущенным
        try:
            while True:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            logger.info("Получен сигнал остановки")
        finally:
            await self.stop()
    
    async def stop(self) -> None:
        """Остановить бота."""
        logger.info("Остановка бота...")
        
        if self.application:
            await self.application.updater.stop()
            await self.application.stop()
            await self.application.shutdown()
        
        if self.db:
            await self.db.close()
        
        logger.info("Бот остановлен")
    
    async def run_scheduler(self) -> None:
        """
        Запустить фоновую задачу проверки напоминаний.
        Должна вызываться параллельно с основным циклом бота.
        """
        import asyncio
        from datetime import datetime
        
        logger.info("Запуск планировщика напоминаний...")
        
        while True:
            try:
                await asyncio.sleep(60)  # Проверяем каждую минуту
                
                due_reminders = await self.db.get_due_reminders()
                
                for reminder in due_reminders:
                    user_settings = await self.db.get_user_settings(reminder.user_id)
                    
                    if user_settings and user_settings.notifications_enabled:
                        await self.notification_service.send_reminder(
                            user_id=reminder.user_id,
                            reminder=reminder,
                            attach_quote=reminder.attach_quote and user_settings.quote_enabled,
                        )
                
            except Exception as e:
                logger.error(f"Ошибка в планировщике: {e}")


# Import asyncio for the scheduler
import asyncio
from telegram import Update


async def main():
    """Точка входа для запуска бота."""
    bot = ReminderBot()
    await bot.start()


if __name__ == "__main__":
    asyncio.run(main())
