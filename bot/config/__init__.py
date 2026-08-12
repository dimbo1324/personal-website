"""
Конфигурация приложения.
Загружает переменные окружения и предоставляет доступ к настройкам.
"""
import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Настройки приложения."""
    
    # Telegram Bot
    telegram_bot_token: str
    telegram_api_base: str = "https://api.telegram.org"
    
    # Database (SQLite для начала, легко мигрирует на PostgreSQL)
    database_url: str = "sqlite+aiosqlite:///./bot_data.db"
    
    # Cleanup settings
    cleanup_enabled: bool = True
    cleanup_interval_days: int = 30  # Удалять сообщения старше 30 дней
    
    # Timezone
    timezone: str = "UTC"
    
    # Logging
    log_level: str = "INFO"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )
    
    @property
    def base_dir(self) -> Path:
        """Базовая директория проекта."""
        return Path(__file__).parent.parent.parent


# Глобальный экземпляр настроек
settings: Optional[Settings] = None


def get_settings() -> Settings:
    """Получить настройки приложения."""
    global settings
    if settings is None:
        settings = Settings()
    return settings
