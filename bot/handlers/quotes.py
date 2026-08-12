"""
Обработчики команд для работы с цитатами.
"""
import logging
from telegram import Update
from telegram.ext import ContextTypes

from bot.services.quote_service import QuoteService
from bot.services.notification_service import NotificationService
from bot.database.repository import Database

logger = logging.getLogger(__name__)


class QuotesHandler:
    """Обработчик команд для цитат."""
    
    def __init__(
        self,
        db: Database,
        quote_service: QuoteService,
        notification_service: NotificationService,
    ):
        self.db = db
        self.quote_service = quote_service
        self.notification_service = notification_service
    
    async def send_random_quote(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Отправить случайную цитату."""
        user = update.effective_user
        if not user:
            return
        
        user_id = str(user.id)
        logger.info(f"Запрос цитаты от {user_id}")
        
        # Проверяем аргументы для категории
        category = None
        if context.args:
            category = context.args[0].lower()
        
        success = await self.notification_service.send_quote_only(user_id, category)
        
        if not success:
            if category:
                await update.message.reply_text(
                    f"❌ Цитаты в категории '{category}' не найдены.\n\n"
                    "Попробуйте другую категорию или отправьте /quote без параметров."
                )
            else:
                await update.message.reply_text(
                    "❌ Не удалось получить цитату. Попробуйте позже."
                )
    
    async def add_quote(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Добавить новую цитату (для администраторов)."""
        user = update.effective_user
        if not user:
            return
        
        user_id = str(user.id)
        
        # Парсим аргументы: текст, автор, категория
        args = context.args
        if len(args) < 1:
            await update.message.reply_text(
                "❌ Использование: /addquote <текст> [автор] [категория]\n\n"
                "Пример: /addquote \"Быть или не быть\" Шекспир wisdom"
            )
            return
        
        text = args[0]
        author = args[1] if len(args) > 1 else None
        category = args[2] if len(args) > 2 else None
        
        try:
            quote = await self.quote_service.add_quote(text, author, category)
            await update.message.reply_text(
                f"✅ Цитата добавлена!\n\n"
                f"ID: {quote.id}\n"
                f'"{quote.text}"\n'
                f"— {quote.author or 'Аноним'}\n"
                f"Категория: {quote.category or 'без категории'}"
            )
            logger.info(f"Добавлена цитата ID={quote.id} пользователем {user_id}")
            
        except ValueError as e:
            await update.message.reply_text(f"❌ Ошибка: {e}")
        except Exception as e:
            logger.error(f"Ошибка при добавлении цитаты: {e}")
            await update.message.reply_text("❌ Произошла ошибка при добавлении цитаты.")
    
    async def list_categories(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Показать список доступных категорий."""
        categories = await self.quote_service.get_categories()
        
        if not categories:
            await update.message.reply_text("📭 Категории пока не созданы.")
            return
        
        message = "🏷️ <b>Доступные категории:</b>\n\n"
        for cat in categories:
            count = len(await self.quote_service.get_quotes_by_category(cat))
            message += f"• {cat} ({count})\n"
        
        message += "\n<i>Используйте /quote &lt;категория&gt; для получения цитаты.</i>"
        
        await update.message.reply_text(message, parse_mode="HTML")
