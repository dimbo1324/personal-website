"""
Сервис управления напоминаниями.
Бизнес-логика для создания, обновления и удаления напоминаний.
"""
import logging
from typing import Optional, List
from datetime import datetime

from bot.database.models import Reminder, ReminderFrequency
from bot.database.repository import Database

logger = logging.getLogger(__name__)


class ReminderService:
    """Сервис управления напоминаниями."""
    
    def __init__(self, db: Database):
        self.db = db
    
    async def create_reminder(
        self,
        user_id: str,
        title: str,
        description: Optional[str] = None,
        frequency: ReminderFrequency = ReminderFrequency.DAILY,
        scheduled_times: Optional[List[str]] = None,
        attach_quote: bool = True,
    ) -> Reminder:
        """
        Создать новое напоминание.
        
        Args:
            user_id: Telegram user ID
            title: Заголовок напоминания
            description: Описание (опционально)
            frequency: Частота повторения
            scheduled_times: Список времени отправки (например, ["09:00", "18:00"])
            attach_quote: Прикреплять ли цитату
            
        Returns:
            Reminder: Созданное напоминание
            
        Raises:
            ValueError: Если некорректные параметры
        """
        # Валидация
        if not title or len(title.strip()) == 0:
            raise ValueError("Заголовок напоминания не может быть пустым")
        
        if len(title) > 255:
            raise ValueError("Заголовок слишком длинный (максимум 255 символов)")
        
        if description and len(description) > 2000:
            raise ValueError("Описание слишком длинное (максимум 2000 символов)")
        
        # Валидация времени
        if scheduled_times:
            self._validate_scheduled_times(scheduled_times)
        else:
            # По умолчанию - одно время в день
            scheduled_times = ["09:00"]
        
        # Вычисляем следующее время выполнения
        next_run = self._calculate_next_run(scheduled_times)
        
        reminder = await self.db.create_reminder(
            user_id=user_id,
            title=title.strip(),
            description=description.strip() if description else None,
            frequency=frequency,
            times_per_day=len(scheduled_times),
            scheduled_times=scheduled_times,
            attach_quote=attach_quote,
        )
        
        # Обновляем next_scheduled_at
        await self.db.update_reminder(reminder.id, next_scheduled_at=next_run)
        
        logger.info(f"Создано напоминание ID={reminder.id} для пользователя {user_id}")
        return reminder
    
    async def get_reminder(self, reminder_id: int, user_id: str) -> Optional[Reminder]:
        """Получить напоминание по ID."""
        return await self.db.get_reminder(reminder_id, user_id)
    
    async def get_user_reminders(
        self,
        user_id: str,
        active_only: bool = True,
    ) -> List[Reminder]:
        """Получить все напоминания пользователя."""
        return await self.db.get_user_reminders(user_id, active_only)
    
    async def update_reminder(
        self,
        reminder_id: int,
        user_id: str,
        **kwargs,
    ) -> Optional[Reminder]:
        """
        Обновить напоминание.
        
        Args:
            reminder_id: ID напоминания
            user_id: Telegram user ID (для проверки прав)
            **kwargs: Поля для обновления
            
        Returns:
            Reminder: Обновленное напоминание или None
        """
        reminder = await self.db.get_reminder(reminder_id, user_id)
        if not reminder:
            logger.warning(f"Напоминание {reminder_id} не найдено для пользователя {user_id}")
            return None
        
        # Валидация scheduled_times если обновляется
        if 'scheduled_times' in kwargs and kwargs['scheduled_times']:
            self._validate_scheduled_times(kwargs['scheduled_times'])
            kwargs['next_scheduled_at'] = self._calculate_next_run(kwargs['scheduled_times'])
        
        # Валидация title
        if 'title' in kwargs:
            if not kwargs['title'] or len(kwargs['title'].strip()) == 0:
                raise ValueError("Заголовок не может быть пустым")
            kwargs['title'] = kwargs['title'].strip()
        
        updated = await self.db.update_reminder(reminder_id, **kwargs)
        if updated:
            logger.info(f"Обновлено напоминание ID={reminder_id}")
        
        return updated
    
    async def delete_reminder(self, reminder_id: int, user_id: str) -> bool:
        """Удалить напоминание."""
        result = await self.db.delete_reminder(reminder_id, user_id)
        if result:
            logger.info(f"Удалено напоминание ID={reminder_id}")
        return result
    
    async def deactivate_reminder(self, reminder_id: int, user_id: str) -> Optional[Reminder]:
        """Деактивировать напоминание (без удаления)."""
        return await self.db.update_reminder(reminder_id, is_active=False)
    
    async def activate_reminder(self, reminder_id: int, user_id: str) -> Optional[Reminder]:
        """Активировать напоминание."""
        reminder = await self.db.get_reminder(reminder_id, user_id)
        if not reminder:
            return None
        
        next_run = self._calculate_next_run(reminder.scheduled_times)
        return await self.db.update_reminder(reminder_id, is_active=True, next_scheduled_at=next_run)
    
    @staticmethod
    def _validate_scheduled_times(times: List[str]) -> None:
        """
        Валидировать список времени.
        
        Args:
            times: Список строк в формате "HH:MM"
            
        Raises:
            ValueError: Если формат некорректен
        """
        if not times:
            raise ValueError("Список времени не может быть пустым")
        
        if len(times) > 10:
            raise ValueError("Максимум 10 временных слотов в день")
        
        for time_str in times:
            try:
                hour, minute = map(int, time_str.split(":"))
                if not (0 <= hour <= 23 and 0 <= minute <= 59):
                    raise ValueError(f"Некорректное время: {time_str}")
            except (ValueError, AttributeError):
                raise ValueError(f"Время должно быть в формате HH:MM, получено: {time_str}")
    
    @staticmethod
    def _calculate_next_run(scheduled_times: Optional[List[str]]) -> Optional[datetime]:
        """
        Вычислить следующее время выполнения.
        
        Args:
            scheduled_times: Список времени отправки
            
        Returns:
            datetime: Следующее время выполнения или None
        """
        if not scheduled_times:
            return None
        
        now = datetime.utcnow()
        today = now.date()
        
        for time_str in scheduled_times:
            hour, minute = map(int, time_str.split(":"))
            candidate = datetime.combine(today, datetime.min.time().replace(hour=hour, minute=minute))
            if candidate > now:
                return candidate
        
        # Если все времена сегодня уже прошли, берем первое время завтра
        from datetime import timedelta
        hour, minute = map(int, scheduled_times[0].split(":"))
        tomorrow = today + timedelta(days=1)
        return datetime.combine(tomorrow, datetime.min.time().replace(hour=hour, minute=minute))
