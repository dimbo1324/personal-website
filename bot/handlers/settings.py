"""
Обработчики команд для настроек пользователя.
"""
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes

from bot.database.repository import Database
from bot.services.notification_service import NotificationService

logger = logging.getLogger(__name__)


class SettingsHandler:
    """Обработчик команд для настроек."""
    
    def __init__(
        self,
        db: Database,
        notification_service: NotificationService,
    ):
        self.db = db
        self.notification_service = notification_service
    
    async def show_settings(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Показать текущие настройки пользователя."""
        user = update.effective_user
        if not user:
            return
        
        user_id = str(user.id)
        logger.info(f"Запрос настроек от {user_id}")
        
        settings = await self.db.get_user_settings(user_id)
        
        if not settings:
            # Создаем настройки по умолчанию
            settings = await self.db.create_user_settings(user_id)
        
        quotes_status = "✅ Включены" if settings.quote_enabled else "❌ Отключены"
        cleanup_status = "✅ Включена" if settings.cleanup_enabled else "❌ Отключена"
        
        message = f"""
⚙️ <b>Ваши настройки</b>

🌍 Часовой пояс: {settings.timezone}
📐 Язык: {settings.language}

💭 Цитаты в напоминаниях: {quotes_status}
🧹 Автоочистка истории: {cleanup_status}
   Период: {settings.cleanup_period_days} дн.

<b>Изменить настройки:</b>
/quotes - Вкл/Выкл цитаты
/cleanup - Настроить очистку
/timezone - Изменить часовой пояс
        """.strip()
        
        keyboard = [
            [InlineKeyboardButton("💭 Цитаты", callback_data="set_quotes")],
            [InlineKeyboardButton("🧹 Очистка", callback_data="set_cleanup")],
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(message, parse_mode="HTML", reply_markup=reply_markup)
    
    async def toggle_quotes(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Переключить отправку цитат."""
        user = update.effective_user
        if not user:
            return
        
        user_id = str(user.id)
        settings = await self.db.get_user_settings(user_id)
        
        if not settings:
            settings = await self.db.create_user_settings(user_id)
        
        new_value = not settings.quote_enabled
        await self.db.update_user_settings(user_id, quote_enabled=new_value)
        
        status = "✅ включены" if new_value else "❌ отключены"
        await update.message.reply_text(f"Цитаты в напоминаниях {status}.")
        
        logger.info(f"Настройка quote_enabled={new_value} для {user_id}")
    
    async def set_cleanup_period(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Установить период автоочистки."""
        user = update.effective_user
        if not user:
            return
        
        user_id = str(user.id)
        args = context.args
        
        if not args:
            await update.message.reply_text(
                "❌ Укажите период в днях.\n\n"
                "Пример: /cleanup 30\n"
                "Доступные значения: 7, 14, 30, 60, 90"
            )
            return
        
        try:
            days = int(args[0])
            valid_periods = [7, 14, 30, 60, 90]
            
            if days not in valid_periods:
                await update.message.reply_text(
                    f"❌ Недопустимое значение. Доступные периоды: {', '.join(map(str, valid_periods))}"
                )
                return
            
            await self.db.update_user_settings(user_id, cleanup_period_days=days)
            await update.message.reply_text(f"✅ Период автоочистки установлен на {days} дней.")
            
            logger.info(f"Настройка cleanup_period_days={days} для {user_id}")
            
        except ValueError:
            await update.message.reply_text("❌ Период должен быть числом.")
    
    async def set_timezone(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Установить часовой пояс."""
        user = update.effective_user
        if not user:
            return
        
        user_id = str(user.id)
        args = context.args
        
        if not args:
            await update.message.reply_text(
                "❌ Укажите часовой пояс.\n\n"
                "Пример: /timezone Europe/Moscow\n"
                "Популярные: UTC, Europe/Moscow, Asia/Almaty, America/New_York"
            )
            return
        
        timezone = args[0]
        
        # Простая валидация
        if '/' not in timezone and timezone != 'UTC':
            await update.message.reply_text(
                "❌ Неверный формат часового пояса.\n\n"
                "Используйте формат IANA, например: Europe/Moscow"
            )
            return
        
        await self.db.update_user_settings(user_id, timezone=timezone)
        await update.message.reply_text(f"✅ Часовой пояс установлен на {timezone}.")
        
        logger.info(f"Настройка timezone={timezone} для {user_id}")
