"""Configuration module for Telegram Bot."""

from pydantic_settings import BaseSettings


class BotConfig(BaseSettings):
    """Bot configuration."""

    telegram_bot_token: str = ""
    log_level: str = "INFO"

    model_config = {"env_file": ".env", "extra": "ignore"}


def get_config() -> BotConfig:
    """Get bot configuration from environment variables."""
    return BotConfig()
