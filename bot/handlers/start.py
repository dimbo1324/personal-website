"""
Обработчик команды /start.
Приветствует пользователя и создает его настройки.
"""
import logging
from telegram import Update
from telegram.ext import ContextTypes

from bot.services.notification_service import NotificationService
from bot.database.repository import Database

logger = logging.getLogger(__name__)


class StartHandler:
    """Обработчик команды /start."""
    
    def __init__(self, db: Database, notification_service: NotificationService):
        self.db = db
        self.notification_service = notification_service
    
    async def handle(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """
        Обработать команду /start.
        
        Args:
            update: Объект обновления Telegram
            context: Контекст бота
        """
        user = update.effective_user
        if not user:
            return
        
        user_id = str(user.id)
        
        logger.info(f"Команда /start от пользователя {user_id} ({user.username})")
        
        # Создаем или обновляем настройки пользователя
        await self.db.create_user_settings(
            user_id=user_id,
            timezone=context.user_data.get('timezone', 'UTC'),
            language=context.user_data.get('language', 'ru'),
        )
        
        # Отправляем приветственное сообщение
        await self.notification_service.send_welcome_message(user_id)
