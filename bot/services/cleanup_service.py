"""
Сервис автоочистки истории чата.
Управляет периодической очисткой старых сообщений.
"""
import logging
from datetime import datetime, timedelta
from typing import List

from telegram import Bot
from telegram.error import TelegramError

from bot.database.repository import Database
from bot.database.models import UserSettings

logger = logging.getLogger(__name__)


class CleanupService:
    """Сервис автоочистки истории чата."""
    
    def __init__(self, bot: Bot, db: Database):
        self.bot = bot
        self.db = db
    
    async def cleanup_user_history(
        self,
        user_id: str,
        days: int = 30,
    ) -> int:
        """
        Очистить историю чата пользователя за последние N дней.
        
        Примечание: Telegram API имеет ограничения на удаление сообщений:
        - Бот может удалять только свои сообщения
        - Сообщения старше 48 часов нельзя удалить
        
        Args:
            user_id: Telegram user ID
            days: Период в днях
            
        Returns:
            int: Количество удаленных сообщений
        """
        settings = await self.db.get_user_settings(user_id)
        
        if not settings or not settings.cleanup_enabled:
            logger.debug(f"Очистка отключена для пользователя {user_id}")
            return 0
        
        # Получаем настройки периода
        cleanup_days = settings.cleanup_period_days or days
        
        try:
            # Telegram не предоставляет API для получения истории сообщений бота
            # Поэтому мы можем удалять только те сообщения, которые отслеживаем локально
            # В данной реализации это заглушка для будущей функциональности
            
            logger.info(f"Запрошена очистка истории для пользователя {user_id} за {cleanup_days} дней")
            
            # TODO: Реализовать трекинг отправленных сообщений в БД
            # и их последующее удаление через bot.delete_message()
            
            return 0
            
        except TelegramError as e:
            logger.error(f"Ошибка при очистке истории пользователя {user_id}: {e}")
            return 0
        except Exception as e:
            logger.error(f"Неожиданная ошибка при очистке: {e}")
            return 0
    
    async def cleanup_all_users(self, default_days: int = 30) -> dict:
        """
        Выполнить очистку для всех пользователей с включенной опцией.
        
        Args:
            default_days: Период по умолчанию
            
        Returns:
            dict: Статистика очистки {user_id: count}
        """
        # TODO: Получить всех пользователей с включенной очисткой
        # Это требует дополнительного метода в repository
        
        logger.info("Запущена плановая очистка истории для всех пользователей")
        return {}
    
    async def can_delete_message(self, message_date: datetime) -> bool:
        """
        Проверить, можно ли удалить сообщение (не старше 48 часов).
        
        Args:
            message_date: Дата отправки сообщения
            
        Returns:
            bool: Можно ли удалить
        """
        max_age = timedelta(hours=48)
        return datetime.utcnow() - message_date < max_age
    
    async def delete_bot_messages(
        self,
        chat_id: str,
        message_ids: List[int],
    ) -> int:
        """
        Удалить список сообщений бота из чата.
        
        Args:
            chat_id: ID чата
            message_ids: Список ID сообщений для удаления
            
        Returns:
            int: Количество успешно удаленных сообщений
        """
        deleted_count = 0
        
        for msg_id in message_ids:
            try:
                await self.bot.delete_message(
                    chat_id=chat_id,
                    message_id=msg_id,
                )
                deleted_count += 1
            except TelegramError as e:
                # Сообщение может быть уже удалено или слишком старое
                logger.debug(f"Не удалось удалить сообщение {msg_id}: {e}")
            except Exception as e:
                logger.error(f"Ошибка при удалении сообщения {msg_id}: {e}")
        
        if deleted_count > 0:
            logger.info(f"Удалено {deleted_count} сообщений из чата {chat_id}")
        
        return deleted_count
