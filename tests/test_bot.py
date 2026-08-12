"""Tests for Telegram Bot."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from src.config import BotConfig, get_config


class TestBotConfig:
    """Tests for BotConfig class."""

    def test_default_values(self):
        """Test default configuration values."""
        config = BotConfig()
        assert config.telegram_bot_token == ""
        assert config.log_level == "INFO"

    @patch.dict("os.environ", {"TELEGRAM_BOT_TOKEN": "test_token_123"})
    def test_env_variable_loading(self):
        """Test loading configuration from environment variables."""
        config = BotConfig()
        assert config.telegram_bot_token == "test_token_123"

    def test_get_config_function(self):
        """Test get_config function returns BotConfig instance."""
        config = get_config()
        assert isinstance(config, BotConfig)


class TestBotHandlers:
    """Tests for bot handlers."""

    @pytest.mark.asyncio
    async def test_start_command(self):
        """Test /start command handler."""
        from src.bot import start_command

        mock_update = MagicMock()
        mock_update.message.reply_text = AsyncMock()
        mock_context = MagicMock()

        await start_command(mock_update, mock_context)

        mock_update.message.reply_text.assert_called_once()
        call_args = mock_update.message.reply_text.call_args[0][0]
        assert "Привет!" in call_args

    @pytest.mark.asyncio
    async def test_help_command(self):
        """Test /help command handler."""
        from src.bot import help_command

        mock_update = MagicMock()
        mock_update.message.reply_text = AsyncMock()
        mock_context = MagicMock()

        await help_command(mock_update, mock_context)

        mock_update.message.reply_text.assert_called_once()
        call_args = mock_update.message.reply_text.call_args[0][0]
        assert "/start" in call_args
        assert "/help" in call_args

    @pytest.mark.asyncio
    async def test_about_command(self):
        """Test /about command handler."""
        from src.bot import about_command

        mock_update = MagicMock()
        mock_update.message.reply_text = AsyncMock()
        mock_context = MagicMock()

        await about_command(mock_update, mock_context)

        mock_update.message.reply_text.assert_called_once()

    @pytest.mark.asyncio
    async def test_echo_message(self):
        """Test echo message handler."""
        from src.bot import echo_message

        mock_update = MagicMock()
        mock_update.message.text = "Hello, bot!"
        mock_update.message.reply_text = AsyncMock()
        mock_context = MagicMock()

        await echo_message(mock_update, mock_context)

        mock_update.message.reply_text.assert_called_once()
        call_args = mock_update.message.reply_text.call_args[0][0]
        assert "Вы сказали:" in call_args
        assert "Hello, bot!" in call_args

    @pytest.mark.asyncio
    async def test_echo_message_no_text(self):
        """Test echo message handler with no text."""
        from src.bot import echo_message

        mock_update = MagicMock()
        mock_update.message.text = None
        mock_update.message.reply_text = AsyncMock()
        mock_context = MagicMock()

        await echo_message(mock_update, mock_context)

        mock_update.message.reply_text.assert_not_called()


class TestCreateApplication:
    """Tests for create_application function."""

    @patch("src.bot.get_config")
    def test_create_application(self, mock_get_config):
        """Test application creation."""
        from src.bot import create_application

        mock_config = MagicMock()
        mock_config.telegram_bot_token = "test_token"
        mock_get_config.return_value = mock_config

        app = create_application()

        assert app is not None
