"""
Утилиты для расчёта времени выполнения напоминаний.
Чистые функции без побочных эффектов, легко тестируемые.
"""
from datetime import datetime, timedelta
from typing import Optional, List
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
import calendar

from bot.database.models import ReminderFrequency


def calculate_next_run(
    frequency: ReminderFrequency,
    scheduled_times: List[str],
    days_of_week: Optional[List[int]] = None,
    day_of_month: Optional[int] = None,
    user_timezone: str = "UTC",
    now: Optional[datetime] = None,
) -> Optional[datetime]:
    """
    Вычислить следующее время выполнения напоминания с учётом часового пояса пользователя.
    
    Args:
        frequency: Частота напоминания
        scheduled_times: Список времён в формате "HH:MM" (локальное время пользователя)
        days_of_week: Список дней недели [0-6] для WEEKLY частоты
        day_of_month: День месяца [1-31] для MONTHLY частоты
        user_timezone: IANA таймзона пользователя (например, "Europe/Moscow")
        now: Текущее время (по умолчанию datetime.now в UTC)
        
    Returns:
        datetime: Следующее время выполнения в UTC или None
    """
    if not scheduled_times:
        return None
    
    try:
        tz = ZoneInfo(user_timezone)
    except (ZoneInfoNotFoundError, KeyError):
        tz = ZoneInfo("UTC")
    
    if now is None:
        now = datetime.now(tz)
    elif now.tzinfo is None:
        # Если naive datetime, считаем что это UTC
        now = now.replace(tzinfo=ZoneInfo("UTC"))
    
    # Конвертируем текущее время в локальное время пользователя
    local_now = now.astimezone(tz)
    
    if frequency == ReminderFrequency.DAILY:
        return _calculate_daily_run(scheduled_times, local_now, tz)
    
    elif frequency == ReminderFrequency.WEEKLY:
        if not days_of_week:
            # Если дни недели не указаны, используем все дни
            days_of_week = [0, 1, 2, 3, 4, 5, 6]
        return _calculate_weekly_run(scheduled_times, days_of_week, local_now, tz)
    
    elif frequency == ReminderFrequency.MONTHLY:
        if day_of_month is None:
            day_of_month = 1
        return _calculate_monthly_run(scheduled_times, day_of_month, local_now, tz)
    
    elif frequency == ReminderFrequency.CUSTOM:
        # CUSTOM работает как DAILY - несколько раз в день
        return _calculate_daily_run(scheduled_times, local_now, tz)
    
    return None


def _calculate_daily_run(
    scheduled_times: List[str],
    local_now: datetime,
    tz: ZoneInfo,
) -> Optional[datetime]:
    """Расчёт для DAILY частоты - каждый день в указанное время."""
    local_today = local_now.date()
    
    for time_str in scheduled_times:
        hour, minute = _parse_time(time_str)
        candidate_local = datetime(
            local_today.year, local_today.month, local_today.day,
            hour, minute, 0, tzinfo=tz
        )
        
        if candidate_local > local_now:
            return candidate_local.astimezone(ZoneInfo("UTC"))
    
    # Все времена сегодня уже прошли - берём первое время завтра
    hour, minute = _parse_time(scheduled_times[0])
    tomorrow = local_today + timedelta(days=1)
    next_local = datetime(tomorrow.year, tomorrow.month, tomorrow.day,
                          hour, minute, 0, tzinfo=tz)
    return next_local.astimezone(ZoneInfo("UTC"))


def _calculate_weekly_run(
    scheduled_times: List[str],
    days_of_week: List[int],
    local_now: datetime,
    tz: ZoneInfo,
) -> Optional[datetime]:
    """
    Расчёт для WEEKLY частоты - конкретные дни недели.
    
    Args:
        scheduled_times: Список времён
        days_of_week: Дни недели [0-6] где 0=Monday
        local_now: Текущее локальное время
        tz: Таймзона
    """
    local_today = local_now.date()
    current_weekday = local_today.weekday()  # 0=Monday
    
    # Проверяем сегодня (если нужный день и время ещё не прошло)
    if current_weekday in days_of_week:
        for time_str in scheduled_times:
            hour, minute = _parse_time(time_str)
            candidate_local = datetime(
                local_today.year, local_today.month, local_today.day,
                hour, minute, 0, tzinfo=tz
            )
            
            if candidate_local > local_now:
                return candidate_local.astimezone(ZoneInfo("UTC"))
    
    # Ищем следующий день недели в будущем
    for days_ahead in range(1, 8):  # Максимум 7 дней вперёд
        next_day = local_today + timedelta(days=days_ahead)
        next_weekday = next_day.weekday()
        
        if next_weekday in days_of_week:
            hour, minute = _parse_time(scheduled_times[0])
            next_local = datetime(
                next_day.year, next_day.month, next_day.day,
                hour, minute, 0, tzinfo=tz
            )
            return next_local.astimezone(ZoneInfo("UTC"))
    
    return None  # Не должно произойти


def _calculate_monthly_run(
    scheduled_times: List[str],
    day_of_month: int,
    local_now: datetime,
    tz: ZoneInfo,
) -> Optional[datetime]:
    """
    Расчёт для MONTHLY частоты - конкретное число месяца.
    
    Если указанного числа нет в текущем месяце (например, 31 февраля),
    используется последний день месяца.
    """
    local_today = local_now.date()
    
    # Определяем фактический день для текущего месяца
    current_year = local_today.year
    current_month = local_today.month
    
    max_day = calendar.monthrange(current_year, current_month)[1]
    actual_day = min(day_of_month, max_day)
    
    # Проверяем сегодня (если нужное число и время ещё не прошло)
    if local_today.day == actual_day:
        for time_str in scheduled_times:
            hour, minute = _parse_time(time_str)
            candidate_local = datetime(
                current_year, current_month, actual_day,
                hour, minute, 0, tzinfo=tz
            )
            
            if candidate_local > local_now:
                return candidate_local.astimezone(ZoneInfo("UTC"))
    
    # Ищем следующий месяц
    for months_ahead in range(1, 13):  # Максимум 12 месяцев вперёд
        next_month = current_month + months_ahead
        next_year = current_year
        
        while next_month > 12:
            next_month -= 12
            next_year += 1
        
        max_day = calendar.monthrange(next_year, next_month)[1]
        actual_day = min(day_of_month, max_day)
        
        hour, minute = _parse_time(scheduled_times[0])
        next_local = datetime(
            next_year, next_month, actual_day,
            hour, minute, 0, tzinfo=tz
        )
        return next_local.astimezone(ZoneInfo("UTC"))
    
    return None  # Не должно произойти


def _parse_time(time_str: str) -> tuple:
    """
    Распарсить строку времени "HH:MM" в кортеж (hour, minute).
    
    Raises:
        ValueError: Если формат некорректен
    """
    try:
        hour, minute = map(int, time_str.split(":"))
        if not (0 <= hour <= 23 and 0 <= minute <= 59):
            raise ValueError(f"Некорректное время: {time_str}")
        return hour, minute
    except (ValueError, AttributeError) as e:
        raise ValueError(f"Время должно быть в формате HH:MM, получено: {time_str}") from e


def validate_timezone(timezone: str) -> bool:
    """
    Валидировать IANA таймзону.
    
    Args:
        timezone: Строка таймзоны (например, "Europe/Moscow")
        
    Returns:
        bool: True если таймзона корректна
    """
    try:
        ZoneInfo(timezone)
        return True
    except (ZoneInfoNotFoundError, KeyError):
        return False


def format_time_for_display(dt: datetime, user_timezone: str) -> str:
    """
    Форматировать datetime для отображения пользователю в его часовом поясе.
    
    Args:
        dt: datetime (предпочтительно UTC)
        user_timezone: IANA таймзона пользователя
        
    Returns:
        str: Форматированная строка "ДД.ММ.ГГГГ ЧЧ:ММ"
    """
    try:
        tz = ZoneInfo(user_timezone)
    except (ZoneInfoNotFoundError, KeyError):
        tz = ZoneInfo("UTC")
    
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=ZoneInfo("UTC"))
    
    local_dt = dt.astimezone(tz)
    return local_dt.strftime("%d.%m.%Y %H:%M")
