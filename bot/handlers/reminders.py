"""
Обработчики команд для управления напоминаниями.
Поддерживает создание, просмотр, редактирование и удаление напоминаний.
"""
import logging
from typing import List, Optional
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes, ConversationHandler

from bot.services.reminder_service import ReminderService
from bot.services.notification_service import NotificationService
from bot.database.models import ReminderFrequency
from bot.database.repository import Database

logger = logging.getLogger(__name__)

# Состояния для ConversationHandler
CREATE_TITLE, CREATE_DESCRIPTION, CREATE_FREQUENCY, CREATE_TIMES = range(4)


class RemindersHandler:
    """Обработчик команд для напоминаний."""
    
    def __init__(
        self,
        db: Database,
        reminder_service: ReminderService,
        notification_service: NotificationService,
    ):
        self.db = db
        self.reminder_service = reminder_service
        self.notification_service = notification_service
    
    async def list_reminders(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Показать все напоминания пользователя."""
        user = update.effective_user
        if not user:
            return
        
        user_id = str(user.id)
        logger.info(f"Запрос списка напоминаний от {user_id}")
        
        reminders = await self.reminder_service.get_user_reminders(user_id, active_only=False)
        
        if not reminders:
            await update.message.reply_text(
                "📭 У вас пока нет напоминаний.\n\n"
                "Создайте первое напоминание командой /create",
                parse_mode="HTML",
            )
            return
        
        message = "📋 <b>Ваши напоминания:</b>\n\n"
        
        for reminder in reminders:
            status_emoji = "✅" if reminder.is_active else "⏸️"
            freq_emoji = self._get_frequency_emoji(reminder.frequency)
            
            message += f"{status_emoji} <b>ID {reminder.id}:</b> {freq_emoji} {reminder.title}\n"
            
            if reminder.scheduled_times:
                times_str = ", ".join(reminder.scheduled_times)
                message += f"   ⏰ Время: {times_str}\n"
            
            if reminder.next_scheduled_at:
                next_run = reminder.next_scheduled_at.strftime("%d.%m.%Y %H:%M")
                message += f"   🕐 Следующее: {next_run}\n"
            
            message += "\n"
        
        message += "<i>Для удаления используйте: /delete &lt;ID&gt;</i>"
        
        await update.message.reply_text(message, parse_mode="HTML")
    
    async def start_create(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        """Начать процесс создания напоминания."""
        user = update.effective_user
        if not user:
            return ConversationHandler.END
        
        user_id = str(user.id)
        logger.info(f"Начато создание напоминания пользователем {user_id}")
        
        await update.message.reply_text(
            "📝 <b>Создание напоминания</b>\n\n"
            "Введите заголовок напоминания (например, 'Принять лекарство'):",
            parse_mode="HTML",
        )
        
        return CREATE_TITLE
    
    async def receive_title(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        """Получить заголовок напоминания."""
        title = update.message.text.strip()
        
        if len(title) == 0:
            await update.message.reply_text(
                "❌ Заголовок не может быть пустым. Попробуйте еще раз:"
            )
            return CREATE_TITLE
        
        if len(title) > 255:
            await update.message.reply_text(
                "❌ Заголовок слишком длинный (максимум 255 символов). Попробуйте еще раз:"
            )
            return CREATE_TITLE
        
        context.user_data['reminder_title'] = title
        
        await update.message.reply_text(
            "✏️ Теперь введите описание напоминания (или отправьте /skip, чтобы пропустить):"
        )
        
        return CREATE_DESCRIPTION
    
    async def receive_description(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        """Получить описание напоминания."""
        if update.message.text and update.message.text.strip() == '/skip':
            context.user_data['reminder_description'] = None
            return await self._show_frequency_menu(update)
        
        description = update.message.text.strip()
        context.user_data['reminder_description'] = description
        
        return await self._show_frequency_menu(update)
    
    async def _show_frequency_menu(self, update: Update) -> int:
        """Показать меню выбора частоты."""
        keyboard = [
            [InlineKeyboardButton("📅 Ежедневно", callback_data="freq_daily")],
            [InlineKeyboardButton("📆 Еженедельно", callback_data="freq_weekly")],
            [InlineKeyboardButton("🗓️ Ежемесячно", callback_data="freq_monthly")],
            [InlineKeyboardButton("⏰ Несколько раз в день", callback_data="freq_custom")],
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            "🔄 Выберите частоту повторения:",
            reply_markup=reply_markup,
        )
        
        return CREATE_FREQUENCY
    
    async def receive_frequency(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        """Обработать выбор частоты."""
        query = update.callback_query
        await query.answer()
        
        freq_choice = query.data
        freq_map = {
            "freq_daily": ReminderFrequency.DAILY,
            "freq_weekly": ReminderFrequency.WEEKLY,
            "freq_monthly": ReminderFrequency.MONTHLY,
            "freq_custom": ReminderFrequency.CUSTOM,
        }
        
        context.user_data['reminder_frequency'] = freq_map[freq_choice]
        
        if freq_choice == "freq_custom":
            await query.edit_message_text(
                "⏰ Введите время отправки через запятую в формате ЧЧ:ММ\n"
                "(например: 09:00, 14:00, 20:00):\n\n"
                "Или отправьте /skip для времени по умолчанию (09:00)"
            )
            return CREATE_TIMES
        else:
            # Для стандартных частот - одно время в день
            await query.edit_message_text(
                "⏰ Введите время отправки в формате ЧЧ:ММ (например, 09:00):\n\n"
                "Или отправьте /skip для времени по умолчанию (09:00)"
            )
            return CREATE_TIMES
    
    async def receive_times(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        """Получить время отправки и создать напоминание."""
        user = update.effective_user
        user_id = str(user.id)
        
        if update.message.text and update.message.text.strip() == '/skip':
            times = ["09:00"]
        else:
            times_input = update.message.text.strip()
            times = [t.strip() for t in times_input.split(",")]
        
        # Валидация времени
        try:
            self._validate_times(times)
        except ValueError as e:
            await update.message.reply_text(f"❌ Ошибка: {e}\n\nПопробуйте еще раз:")
            return CREATE_TIMES
        
        # Создаем напоминание
        try:
            reminder = await self.reminder_service.create_reminder(
                user_id=user_id,
                title=context.user_data['reminder_title'],
                description=context.user_data.get('reminder_description'),
                frequency=context.user_data['reminder_frequency'],
                scheduled_times=times,
                attach_quote=True,
            )
            
            await update.message.reply_text(
                f"✅ <b>Напоминание создано!</b>\n\n"
                f"ID: {reminder.id}\n"
                f"📌 {reminder.title}\n"
                f"⏰ Время: {', '.join(times)}\n\n"
                f"Бот напомнит вам в указанное время.",
                parse_mode="HTML",
            )
            
            logger.info(f"Создано напоминание ID={reminder.id} для {user_id}")
            
        except Exception as e:
            logger.error(f"Ошибка при создании напоминания: {e}")
            await update.message.reply_text(
                "❌ Произошла ошибка при создании напоминания. Попробуйте позже."
            )
        
        # Очищаем контекст
        context.user_data.clear()
        
        return ConversationHandler.END
    
    async def delete_reminder(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Удалить напоминание по ID."""
        user = update.effective_user
        if not user:
            return
        
        user_id = str(user.id)
        
        # Парсим ID из аргумента
        args = context.args
        if not args:
            await update.message.reply_text(
                "❌ Укажите ID напоминания.\n\n"
                "Пример: /delete 5"
            )
            return
        
        try:
            reminder_id = int(args[0])
        except ValueError:
            await update.message.reply_text("❌ ID должен быть числом.")
            return
        
        success = await self.reminder_service.delete_reminder(reminder_id, user_id)
        
        if success:
            await update.message.reply_text(f"✅ Напоминание #{reminder_id} удалено.")
        else:
            await update.message.reply_text(
                f"❌ Напоминание #{reminder_id} не найдено или у вас нет прав на его удаление."
            )
    
    @staticmethod
    def _validate_times(times: List[str]) -> None:
        """Валидировать формат времени."""
        if not times:
            raise ValueError("Список времени не может быть пустым")
        
        for time_str in times:
            try:
                hour, minute = map(int, time_str.split(":"))
                if not (0 <= hour <= 23 and 0 <= minute <= 59):
                    raise ValueError(f"Некорректное время: {time_str}")
            except (ValueError, AttributeError):
                raise ValueError(f"Время должно быть в формате ЧЧ:ММ: {time_str}")
    
    @staticmethod
    def _get_frequency_emoji(frequency) -> str:
        """Получить эмодзи для частоты."""
        emojis = {
            "once": "📌",
            "daily": "📅",
            "weekly": "📆",
            "monthly": "🗓️",
            "custom": "⏰",
        }
        freq_value = frequency.value if hasattr(frequency, 'value') else frequency
        return emojis.get(freq_value, "⏰")
