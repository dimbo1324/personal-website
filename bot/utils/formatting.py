"""
Утилиты форматирования и валидации.
"""
import html
from typing import Optional


def escape_html(text: str) -> str:
    """
    Экранировать HTML-спецсимволы в пользовательском тексте.
    
    Telegram Bot API с parse_mode="HTML" требует экранирования:
    - < -> &lt;
    - > -> &gt;
    - & -> &amp;
    
    Args:
        text: Исходный текст
        
    Returns:
        str: Экранированный текст
    """
    if text is None:
        return ""
    return html.escape(str(text))


def format_reminder_title(title: str) -> str:
    """
    Форматировать заголовок напоминания для HTML-сообщения.
    
    Args:
        title: Заголовок напоминания
        
    Returns:
        str: Безопасный HTML-заголовок
    """
    escaped = escape_html(title.strip())
    return f"<b>{escaped}</b>"


def format_reminder_description(description: Optional[str]) -> str:
    """
    Форматировать описание напоминания для HTML-сообщения.
    
    Args:
        description: Описание напоминания
        
    Returns:
        str: Безопасное HTML-описание или пустая строка
    """
    if not description:
        return ""
    return escape_html(description.strip())


def format_quote_text(text: str) -> str:
    """
    Форматировать текст цитаты для HTML-сообщения.
    
    Args:
        text: Текст цитаты
        
    Returns:
        str: Безопасный HTML-текст цитаты в курсиве
    """
    escaped = escape_html(text.strip())
    return f"<i>«{escaped}»</i>"


def format_author(author: Optional[str]) -> str:
    """
    Форматировать имя автора для HTML-сообщения.
    
    Args:
        author: Имя автора
        
    Returns:
        str: Безопасное HTML-имя автора
    """
    if not author:
        return ""
    escaped = escape_html(author.strip())
    return f"<b>{escaped}</b>"


def validate_time_format(time_str: str) -> bool:
    """
    Валидировать формат времени "HH:MM".
    
    Args:
        time_str: Строка времени
        
    Returns:
        bool: True если формат корректен
    """
    try:
        hour, minute = map(int, time_str.split(":"))
        return 0 <= hour <= 23 and 0 <= minute <= 59
    except (ValueError, AttributeError):
        return False


def validate_reminder_title(title: str) -> tuple[bool, str]:
    """
    Валидировать заголовок напоминания.
    
    Args:
        title: Заголовок для проверки
        
    Returns:
        tuple[bool, str]: (успех, сообщение об ошибке)
    """
    if not title or len(title.strip()) == 0:
        return False, "Заголовок напоминания не может быть пустым"
    
    if len(title) > 255:
        return False, "Заголовок слишком длинный (максимум 255 символов)"
    
    return True, ""


def validate_description(description: Optional[str]) -> tuple[bool, str]:
    """
    Валидировать описание напоминания.
    
    Args:
        description: Описание для проверки
        
    Returns:
        tuple[bool, str]: (успех, сообщение об ошибке)
    """
    if description and len(description) > 2000:
        return False, "Описание слишком длинное (максимум 2000 символов)"
    
    return True, ""


def validate_scheduled_times(times: list[str]) -> tuple[bool, str]:
    """
    Валидировать список времён напоминания.
    
    Args:
        times: Список строк времени
        
    Returns:
        tuple[bool, str]: (успех, сообщение об ошибке)
    """
    if not times:
        return False, "Список времени не может быть пустым"
    
    if len(times) > 10:
        return False, "Максимум 10 временных слотов в день"
    
    for time_str in times:
        if not validate_time_format(time_str):
            return False, f"Время должно быть в формате HH:MM, получено: {time_str}"
    
    return True, ""


def validate_day_of_month(day: int) -> tuple[bool, str]:
    """
    Валидировать день месяца для MONTHLY частоты.
    
    Args:
        day: День месяца [1-31]
        
    Returns:
        tuple[bool, str]: (успех, сообщение об ошибке)
    """
    if not isinstance(day, int) or day < 1 or day > 31:
        return False, "День месяца должен быть от 1 до 31"
    
    return True, ""


def validate_days_of_week(days: list[int]) -> tuple[bool, str]:
    """
    Валидировать список дней недели для WEEKLY частоты.
    
    Args:
        days: Список дней недели [0-6] где 0=Monday
        
    Returns:
        tuple[bool, str]: (успех, сообщение об ошибке)
    """
    if not days:
        return False, "Должен быть выбран хотя бы один день недели"
    
    if not isinstance(days, list):
        return False, "Дни недели должны быть списком чисел"
    
    for day in days:
        if not isinstance(day, int) or day < 0 or day > 6:
            return False, "Дни недели должны быть числами от 0 до 6 (0=Monday)"
    
    return True, ""
