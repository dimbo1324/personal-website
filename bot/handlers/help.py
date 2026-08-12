"""
Обработчик команды /help.
Показывает справку по боту.
"""
import logging
from telegram import Update
from telegram.ext import ContextTypes

from bot.services.notification_service import NotificationService

logger = logging.getLogger(__name__)


class HelpHandler:
    """Обработчик команды /help."""
    
    def __init__(self, notification_service: NotificationService):
        self.notification_service = notification_service
    
    async def handle(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """
        Обработать команду /help.
        
        Args:
            update: Объект обновления Telegram
            context: Контекст бота
        """
        user = update.effective_user
        if not user:
            return
        
        user_id = str(user.id)
        
        logger.info(f"Команда /help от пользователя {user_id}")
        
        await self.notification_service.send_help_message(user_id)
