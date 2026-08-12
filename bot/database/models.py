"""
Модели данных для базы данных.
Использует SQLAlchemy с асинхронной поддержкой.
"""
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, 
    ForeignKey, Enum as SQLEnum, JSON
)
from sqlalchemy.orm import relationship, declarative_base
import enum

Base = declarative_base()


class ReminderFrequency(enum.Enum):
    """Частота напоминаний."""
    ONCE = "once"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"  # Несколько раз в день


class Reminder(Base):
    """Модель напоминания."""
    __tablename__ = "reminders"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), nullable=False, index=True)  # Telegram user ID
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    frequency = Column(SQLEnum(ReminderFrequency), nullable=False, default=ReminderFrequency.DAILY)
    times_per_day = Column(Integer, default=1)  # Для CUSTOM частоты
    scheduled_times = Column(JSON, nullable=True)  # Список времени отправки ["09:00", "14:00", "20:00"]
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_sent_at = Column(DateTime, nullable=True)
    next_scheduled_at = Column(DateTime, nullable=True)
    
    # Связь с цитатами (опционально прикреплять к напоминанию)
    attach_quote = Column(Boolean, default=True)
    
    def __repr__(self) -> str:
        return f"<Reminder(id={self.id}, user_id={self.user_id}, title='{self.title}')>"
    
    def get_next_run(self) -> Optional[datetime]:
        """Вычислить следующее время выполнения."""
        if not self.is_active or not self.scheduled_times:
            return None
        
        now = datetime.utcnow()
        today = now.date()
        
        for time_str in self.scheduled_times:
            hour, minute = map(int, time_str.split(":"))
            candidate = datetime.combine(today, datetime.min.time().replace(hour=hour, minute=minute))
            if candidate > now:
                return candidate
        
        # Если все времена сегодня уже прошли, берем первое время завтра
        if self.scheduled_times:
            hour, minute = map(int, self.scheduled_times[0].split(":"))
            tomorrow = today + timedelta(days=1)
            return datetime.combine(tomorrow, datetime.min.time().replace(hour=hour, minute=minute))
        
        return None


class Quote(Base):
    """Модель цитаты для мотивации."""
    __tablename__ = "quotes"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    text = Column(Text, nullable=False)
    author = Column(String(255), nullable=True)
    category = Column(String(100), nullable=True)  # Например: "motivation", "wisdom", "success"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    used_count = Column(Integer, default=0)  # Сколько раз была отправлена
    
    def __repr__(self) -> str:
        return f"<Quote(id={self.id}, author='{self.author}', category='{self.category}')>"


class UserSettings(Base):
    """Настройки пользователя."""
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), nullable=False, unique=True, index=True)
    timezone = Column(String(50), default="UTC")
    language = Column(String(10), default="ru")
    notifications_enabled = Column(Boolean, default=True)
    quote_enabled = Column(Boolean, default=True)  # Включить отправку цитат
    cleanup_enabled = Column(Boolean, default=True)  # Включить автоочистку
    cleanup_period_days = Column(Integer, default=30)  # Период очистки в днях
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self) -> str:
        return f"<UserSettings(user_id={self.user_id}, timezone={self.timezone})>"
