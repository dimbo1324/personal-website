"""
Тесты для сервиса цитат.
"""
import pytest
from bot.database.repository import Database
from bot.services.quote_service import QuoteService


@pytest.fixture
async def db():
    """Создать тестовую базу данных."""
    test_db = Database("sqlite+aiosqlite:///./test_quotes.db")
    await test_db.init_db()
    yield test_db
    await test_db.close()


@pytest.fixture
async def quote_service(db):
    """Создать сервис цитат."""
    service = QuoteService(db)
    # Не инициализируем дефолтные цитаты для чистоты тестов
    return service


@pytest.mark.asyncio
async def test_add_quote(quote_service):
    """Тест добавления цитаты."""
    quote = await quote_service.add_quote(
        text="Тестовая цитата",
        author="Тестовый Автор",
        category="test",
    )
    
    assert quote.id is not None
    assert quote.text == "Тестовая цитата"
    assert quote.author == "Тестовый Автор"
    assert quote.category == "test"
    assert quote.is_active is True


@pytest.mark.asyncio
async def test_add_quote_validation_empty_text(quote_service):
    """Тест валидации: пустой текст цитаты."""
    with pytest.raises(ValueError, match="Текст цитаты не может быть пустым"):
        await quote_service.add_quote(text="")


@pytest.mark.asyncio
async def test_get_random_quote(quote_service):
    """Тест получения случайной цитаты."""
    # Добавляем несколько цитат
    await quote_service.add_quote(text="Цитата 1", author="Автор 1", category="cat1")
    await quote_service.add_quote(text="Цитата 2", author="Автор 2", category="cat1")
    await quote_service.add_quote(text="Цитата 3", author="Автор 3", category="cat2")
    
    # Получаем случайную
    quote = await quote_service.get_random_quote()
    assert quote is not None
    assert quote.text in ["Цитата 1", "Цитата 2", "Цитата 3"]


@pytest.mark.asyncio
async def test_get_random_quote_by_category(quote_service):
    """Тест получения цитаты по категории."""
    await quote_service.add_quote(text="Цитата мотивация", category="motivation")
    await quote_service.add_quote(text="Цитата мудрость", category="wisdom")
    
    # Получаем только motivation
    quote = await quote_service.get_random_quote(category="motivation")
    assert quote is not None
    assert quote.category == "motivation"
    
    # Пустая категория
    quote = await quote_service.get_random_quote(category="nonexistent")
    assert quote is None


@pytest.mark.asyncio
async def test_get_categories(quote_service):
    """Тест получения списка категорий."""
    await quote_service.add_quote(text="Цитата 1", category="cat1")
    await quote_service.add_quote(text="Цитата 2", category="cat2")
    await quote_service.add_quote(text="Цитата 3", category="cat1")  # Дубликат категории
    
    categories = await quote_service.get_categories()
    
    assert len(categories) == 2
    assert "cat1" in categories
    assert "cat2" in categories


@pytest.mark.asyncio
async def test_initialize_default_quotes(quote_service):
    """Тест инициализации цитат по умолчанию."""
    count = await quote_service.initialize_default_quotes()
    
    assert count > 0
    
    # Повторный вызов не должен добавлять цитаты
    count2 = await quote_service.initialize_default_quotes()
    assert count2 == 0
    
    # Проверяем что цитаты есть
    all_quotes = await quote_service.get_all_quotes()
    assert len(all_quotes) > 0
