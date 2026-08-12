"""
Репозиторий для работы с базой данных.
Предоставляет асинхронный доступ к данным через SQLAlchemy.
"""
from typing import Optional, List, TypeVar, Generic
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.future import select
from sqlalchemy import delete, update

from .models import Base, Reminder, Quote, UserSettings, ReminderFrequency

T = TypeVar('T')


class Database:
    """Асинхронный менеджер базы данных."""
    
    def __init__(self, database_url: str):
        self.engine = create_async_engine(
            database_url,
            echo=False,  # Включить для отладки SQL запросов
            future=True,
        )
        self.async_session_maker = async_sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
    
    async def init_db(self) -> None:
        """Инициализировать базу данных (создать таблицы)."""
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    
    async def close(self) -> None:
        """Закрыть соединение с базой данных."""
        await self.engine.dispose()
    
    async def get_session(self) -> AsyncSession:
        """Получить сессию базы данных."""
        async with self.async_session_maker() as session:
            yield session
    
    # Reminder operations
    async def create_reminder(
        self,
        user_id: str,
        title: str,
        description: Optional[str] = None,
        frequency: ReminderFrequency = ReminderFrequency.DAILY,
        times_per_day: int = 1,
        scheduled_times: Optional[List[str]] = None,
        attach_quote: bool = True,
    ) -> Reminder:
        """Создать новое напоминание."""
        async with self.async_session_maker() as session:
            reminder = Reminder(
                user_id=user_id,
                title=title,
                description=description,
                frequency=frequency,
                times_per_day=times_per_day,
                scheduled_times=scheduled_times,
                attach_quote=attach_quote,
                next_scheduled_at=datetime.utcnow(),  # Будет пересчитано
            )
            session.add(reminder)
            await session.commit()
            await session.refresh(reminder)
            return reminder
    
    async def get_reminder(self, reminder_id: int, user_id: Optional[str] = None) -> Optional[Reminder]:
        """Получить напоминание по ID."""
        async with self.async_session_maker() as session:
            query = select(Reminder).where(Reminder.id == reminder_id)
            if user_id:
                query = query.where(Reminder.user_id == user_id)
            result = await session.execute(query)
            return result.scalar_one_or_none()
    
    async def get_user_reminders(self, user_id: str, active_only: bool = True) -> List[Reminder]:
        """Получить все напоминания пользователя."""
        async with self.async_session_maker() as session:
            query = select(Reminder).where(Reminder.user_id == user_id)
            if active_only:
                query = query.where(Reminder.is_active == True)
            result = await session.execute(query)
            return list(result.scalars().all())
    
    async def update_reminder(self, reminder_id: int, **kwargs) -> Optional[Reminder]:
        """Обновить напоминание."""
        async with self.async_session_maker() as session:
            reminder = await self.get_reminder(reminder_id)
            if not reminder:
                return None
            
            for key, value in kwargs.items():
                if hasattr(reminder, key):
                    setattr(reminder, key, value)
            
            await session.commit()
            await session.refresh(reminder)
            return reminder
    
    async def delete_reminder(self, reminder_id: int, user_id: Optional[str] = None) -> bool:
        """Удалить напоминание."""
        async with self.async_session_maker() as session:
            query = delete(Reminder).where(Reminder.id == reminder_id)
            if user_id:
                query = query.where(Reminder.user_id == user_id)
            result = await session.execute(query)
            await session.commit()
            return result.rowcount > 0
    
    async def get_due_reminders(self) -> List[Reminder]:
        """Получить напоминания, которые нужно отправить сейчас."""
        async with self.async_session_maker() as session:
            now = datetime.utcnow()
            query = select(Reminder).where(
                Reminder.is_active == True,
                Reminder.next_scheduled_at <= now,
            )
            result = await session.execute(query)
            return list(result.scalars().all())
    
    # Quote operations
    async def create_quote(
        self,
        text: str,
        author: Optional[str] = None,
        category: Optional[str] = None,
    ) -> Quote:
        """Создать новую цитату."""
        async with self.async_session_maker() as session:
            quote = Quote(
                text=text,
                author=author,
                category=category,
            )
            session.add(quote)
            await session.commit()
            await session.refresh(quote)
            return quote
    
    async def get_random_quote(self, category: Optional[str] = None) -> Optional[Quote]:
        """Получить случайную цитату."""
        async with self.async_session_maker() as session:
            query = select(Quote).where(Quote.is_active == True)
            if category:
                query = query.where(Quote.category == category)
            result = await session.execute(query)
            quotes = list(result.scalars().all())
            
            if not quotes:
                return None
            
            import random
            quote = random.choice(quotes)
            
            # Увеличить счетчик использования
            quote.used_count += 1
            await session.commit()
            
            return quote
    
    async def get_all_quotes(self) -> List[Quote]:
        """Получить все цитаты."""
        async with self.async_session_maker() as session:
            result = await session.execute(select(Quote))
            return list(result.scalars().all())
    
    # User settings operations
    async def get_user_settings(self, user_id: str) -> Optional[UserSettings]:
        """Получить настройки пользователя."""
        async with self.async_session_maker() as session:
            result = await session.execute(
                select(UserSettings).where(UserSettings.user_id == user_id)
            )
            return result.scalar_one_or_none()
    
    async def create_user_settings(
        self,
        user_id: str,
        timezone: str = "UTC",
        language: str = "ru",
    ) -> UserSettings:
        """Создать или обновить настройки пользователя."""
        async with self.async_session_maker() as session:
            settings = await self.get_user_settings(user_id)
            
            if settings:
                settings.timezone = timezone
                settings.language = language
                settings.updated_at = datetime.utcnow()
                await session.commit()
                await session.refresh(settings)
                return settings
            
            settings = UserSettings(
                user_id=user_id,
                timezone=timezone,
                language=language,
            )
            session.add(settings)
            await session.commit()
            await session.refresh(settings)
            return settings
    
    async def update_user_settings(self, user_id: str, **kwargs) -> Optional[UserSettings]:
        """Обновить настройки пользователя."""
        async with self.async_session_maker() as session:
            settings = await self.get_user_settings(user_id)
            if not settings:
                return None
            
            for key, value in kwargs.items():
                if hasattr(settings, key):
                    setattr(settings, key, value)
            
            settings.updated_at = datetime.utcnow()
            await session.commit()
            await session.refresh(settings)
            return settings
    
    # Cleanup operations
    async def cleanup_old_messages(self, user_id: str, days: int) -> int:
        """
        Очистить старые сообщения из истории чата.
        Возвращает количество удаленных записей (для логирования).
        
        Примечание: Реальная очистка сообщений Telegram происходит через API бота.
        Этот метод очищает только локальные данные.
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Здесь можно добавить логику очистки локальных логов/истории
        # Для Telegram это делается через delete_message API
        
        return 0  # Заглушка, реальная очистка в сервисе
