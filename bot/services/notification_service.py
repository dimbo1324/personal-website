"""
Сервис уведомлений.
Отвечает за отправку сообщений пользователю через Telegram Bot API.
"""
import logging
from typing import Optional, List
from datetime import datetime

from telegram import Bot
from telegram.error import TelegramError

from bot.database.models import Reminder, Quote
from bot.database.repository import Database
from bot.config import Settings

logger = logging.getLogger(__name__)


class NotificationService:
    """Сервис отправки уведомлений."""
    
    def __init__(self, bot: Bot, db: Database):
        self.bot = bot
        self.db = db
    
    async def send_reminder(
        self,
        user_id: str,
        reminder: Reminder,
        attach_quote: bool = True,
    ) -> bool:
        """
        Отправить напоминание пользователю.
        
        Args:
            user_id: Telegram user ID
            reminder: Объект напоминания
            attach_quote: Прикрепить цитату
            
        Returns:
            bool: Успешность отправки
        """
        try:
            # Формируем текст напоминания
            message = self._format_reminder_message(reminder)
            
            # Прикрепляем цитату если нужно
            if attach_quote:
                quote = await self.db.get_random_quote()
                if quote:
                    message += "\n\n" + self._format_quote_message(quote)
            
            # Отправляем сообщение
            await self.bot.send_message(
                chat_id=user_id,
                text=message,
                parse_mode="HTML",
            )
            
            # Обновляем время последней отправки
            await self.db.update_reminder(
                reminder.id,
                last_sent_at=datetime.utcnow(),
                next_scheduled_at=reminder.get_next_run(),
            )
            
            logger.info(f"Напоминание '{reminder.title}' отправлено пользователю {user_id}")
            return True
            
        except TelegramError as e:
            logger.error(f"Ошибка Telegram при отправке напоминания: {e}")
            return False
        except Exception as e:
            logger.error(f"Неожиданная ошибка при отправке напоминания: {e}")
            return False
    
    async def send_quote_only(
        self,
        user_id: str,
        category: Optional[str] = None,
    ) -> bool:
        """
        Отправить только цитату пользователю.
        
        Args:
            user_id: Telegram user ID
            category: Категория цитаты (опционально)
            
        Returns:
            bool: Успешность отправки
        """
        try:
            quote = await self.db.get_random_quote(category)
            
            if not quote:
                logger.warning(f"Цитаты не найдены для категории {category}")
                return False
            
            message = self._format_quote_message(quote)
            
            await self.bot.send_message(
                chat_id=user_id,
                text=message,
                parse_mode="HTML",
            )
            
            logger.info(f"Цитата отправлена пользователю {user_id}")
            return True
            
        except TelegramError as e:
            logger.error(f"Ошибка Telegram при отправке цитаты: {e}")
            return False
        except Exception as e:
            logger.error(f"Неожиданная ошибка при отправке цитаты: {e}")
            return False
    
    async def send_welcome_message(self, user_id: str) -> bool:
        """
        Отправить приветственное сообщение новому пользователю.
        
        Args:
            user_id: Telegram user ID
            
        Returns:
            bool: Успешность отправки
        """
        welcome_text = """
👋 <b>Добро пожаловать в Reminder Bot!</b>

Я ваш персональный помощник для напоминаний и мотивации.

<b>Что я умею:</b>
✅ Создавать напоминания с гибкой настройкой времени
✅ Отправлять несколько напоминаний в день
✅ Прикреплять мотивирующие цитаты к напоминаниям
✅ Автоматически очищать историю переписки

<b>Команды:</b>
/start - Запустить бота
/help - Показать справку
/create - Создать напоминание
/my_reminders - Мои напоминания
/settings - Настройки
/quote - Получить случайную цитату

Начните с создания вашего первого напоминания командой /create! 🚀
        """.strip()
        
        try:
            await self.bot.send_message(
                chat_id=user_id,
                text=welcome_text,
                parse_mode="HTML",
            )
            return True
        except TelegramError as e:
            logger.error(f"Ошибка при отправке приветствия: {e}")
            return False
    
    async def send_help_message(self, user_id: str) -> bool:
        """Отправить справку пользователю."""
        help_text = """
ℹ️ <b>Справка по боту</b>

<b>Управление напоминаниями:</b>
/create - Создать новое напоминание
/my_reminders - Просмотреть все активные напоминания
/delete &lt;ID&gt; - Удалить напоминание по ID
/edit &lt;ID&gt; - Редактировать напоминание

<b>Настройки:</b>
/settings - Изменить настройки (часовой пояс, язык)
/cleanup - Настроить автоочистку истории

<b>Мотивация:</b>
/quote - Получить случайную цитату
/toggle_quotes - Включить/выключить цитаты в напоминаниях

<b>Общие команды:</b>
/start - Перезапустить бота
/about - О боте

💡 <i>Совет:</i> Вы можете настроить несколько напоминаний на разные времена дня!
        """.strip()
        
        try:
            await self.bot.send_message(
                chat_id=user_id,
                text=help_text,
                parse_mode="HTML",
            )
            return True
        except TelegramError as e:
            logger.error(f"Ошибка при отправке справки: {e}")
            return False
    
    def _format_reminder_message(self, reminder: Reminder) -> str:
        """Форматировать сообщение напоминания."""
        emoji = self._get_frequency_emoji(reminder.frequency)
        
        message = f"""
{emoji} <b>{reminder.title}</b>
        """.strip()
        
        if reminder.description:
            message += f"\n\n{reminder.description}"
        
        if reminder.scheduled_times:
            times_str = ", ".join(reminder.scheduled_times)
            message += f"\n\n⏰ <b>Время:</b> {times_str}"
        
        return message
    
    def _format_quote_message(self, quote: Quote) -> str:
        """Форматировать сообщение с цитатой."""
        message = f"""
💭 <i>"{quote.text}"</i>
        """.strip()
        
        if quote.author:
            message += f"\n\n— <b>{quote.author}</b>"
        
        if quote.category:
            message += f"\n\n🏷️ <i>Категория: {quote.category}</i>"
        
        return message
    
    @staticmethod
    def _get_frequency_emoji(frequency) -> str:
        """Получить эмодзи для частоты напоминания."""
        emojis = {
            "once": "📌",
            "daily": "📅",
            "weekly": "📆",
            "monthly": "🗓️",
            "custom": "⏰",
        }
        return emojis.get(frequency.value if hasattr(frequency, 'value') else frequency, "⏰")
