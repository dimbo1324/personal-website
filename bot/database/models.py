"""
Модели данных для базы данных.
Использует SQLAlchemy с асинхронной поддержкой.
"""
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, 
    ForeignKey, Enum as SQLEnum, JSON, Index
)
from sqlalchemy.orm import relationship, declarative_base
import enum
from zoneinfo import ZoneInfo

Base = declarative_base()


class ReminderFrequency(enum.Enum):
    """Частота напоминаний."""
    DAILY = "daily"           # Каждый день в указанное время
    WEEKLY = "weekly"         # Конкретные дни недели
    MONTHLY = "monthly"       # Конкретное число месяца
    CUSTOM = "custom"         # Несколько раз в день


class DayOfWeek(enum.IntEnum):
    """Дни недели для WEEKLY частоты."""
    MONDAY = 0
    TUESDAY = 1
    WEDNESDAY = 2
    THURSDAY = 3
    FRIDAY = 4
    SATURDAY = 5
    SUNDAY = 6


class Reminder(Base):
    """Модель напоминания."""
    __tablename__ = "reminders"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), nullable=False, index=True)  # Telegram user ID
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    frequency = Column(SQLEnum(ReminderFrequency), nullable=False, default=ReminderFrequency.DAILY)
    
    # Для WEEKLY: список дней недели [0-6] где 0=Monday
    days_of_week = Column(JSON, nullable=True)  # например [0, 3, 5] для Пн, Чт, Сб
    
    # Для MONTHLY: число месяца (1-31)
    day_of_month = Column(Integer, nullable=True)
    
    # Список времени отправки ["09:00", "14:00", "20:00"]
    scheduled_times = Column(JSON, nullable=True)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_sent_at = Column(DateTime, nullable=True)
    next_scheduled_at = Column(DateTime, nullable=True)
    
    # Связь с цитатами (опционально прикреплять к напоминанию)
    attach_quote = Column(Boolean, default=True)
    
    def __repr__(self) -> str:
        return f"<Reminder(id={self.id}, user_id={self.user_id}, title='{self.title}')>"


class SentMessage(Base):
    """Модель отправленного сообщения для отслеживания очистки."""
    __tablename__ = "sent_messages"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    chat_id = Column(String(50), nullable=False, index=True)  # Telegram chat ID
    message_id = Column(Integer, nullable=False)  # Telegram message ID
    message_type = Column(String(20), nullable=False)  # "reminder", "quote", "system"
    sent_at = Column(DateTime, default=datetime.utcnow, index=True)  # UTC время отправки
    
    # Индекс для быстрого поиска сообщений для очистки
    __table_args__ = (
        Index('ix_sent_messages_chat_sent', 'chat_id', 'sent_at'),
    )
    
    def __repr__(self) -> str:
        return f"<SentMessage(id={self.id}, chat_id={self.chat_id}, message_id={self.message_id})>"


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
