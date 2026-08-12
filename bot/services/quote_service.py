"""
Сервис управления цитатами.
Загрузка, хранение и выдача мотивирующих цитат.
"""
import logging
from typing import Optional, List

from bot.database.models import Quote
from bot.database.repository import Database

logger = logging.getLogger(__name__)


class QuoteService:
    """Сервис управления цитатами."""
    
    # Базовый набор цитат для старта
    DEFAULT_QUOTES = [
        {
            "text": "Путь в тысячу ли начинается с первого шага.",
            "author": "Лао-цзы",
            "category": "motivation",
        },
        {
            "text": "Не важно, как медленно ты идешь, главное — не останавливайся.",
            "author": "Конфуций",
            "category": "motivation",
        },
        {
            "text": "Успех — это способность идти от неудачи к неудаче, не теряя энтузиазма.",
            "author": "Уинстон Черчилль",
            "category": "success",
        },
        {
            "text": "Лучшее время, чтобы посадить дерево, было 20 лет назад. Следующее лучшее время — сегодня.",
            "author": "Китайская пословица",
            "category": "wisdom",
        },
        {
            "text": "Ваше время ограничено, не тратьте его, живя чужой жизнью.",
            "author": "Стив Джобс",
            "category": "motivation",
        },
        {
            "text": "Единственный способ делать великие дела — любить то, что вы делаете.",
            "author": "Стив Джобс",
            "category": "success",
        },
        {
            "text": "Жизнь — это то, что с вами случается, пока вы строите другие планы.",
            "author": "Джон Леннон",
            "category": "wisdom",
        },
        {
            "text": "Неудача — это просто возможность начать снова, но уже более мудро.",
            "author": "Генри Форд",
            "category": "motivation",
        },
        {
            "text": "Сложнее всего начать действовать, все остальное зависит только от упорства.",
            "author": "Амелия Эрхарт",
            "category": "motivation",
        },
        {
            "text": "Логика приведет вас из пункта А в пункт Б. Воображение приведет вас куда угодно.",
            "author": "Альберт Эйнштейн",
            "category": "wisdom",
        },
        {
            "text": "Через 20 лет вы будете больше жалеть о том, чего не сделали, чем о том, что сделали.",
            "author": "Марк Твен",
            "category": "motivation",
        },
        {
            "text": "Не пытайтесь стать человеком успеха. Лучше станьте ценным человеком.",
            "author": "Альберт Эйнштейн",
            "category": "wisdom",
        },
        {
            "text": "Великие умы обсуждают идеи; средние умы обсуждают события; мелкие умы обсуждают людей.",
            "author": "Элеонора Рузвельт",
            "category": "wisdom",
        },
        {
            "text": "Я не терпел поражений. Я просто нашел 10 000 способов, которые не работают.",
            "author": "Томас Эдисон",
            "category": "success",
        },
        {
            "text": "Если вы слышите внутренний голос, который говорит: «Вы не сможете рисовать», знайте — это ложь.",
            "author": "Уинстон Черчилль",
            "category": "motivation",
        },
        {
            "text": "Мир принадлежит тем, кто видит его прекрасным.",
            "author": "Ральф Уолдо Эмерсон",
            "category": "wisdom",
        },
        {
            "text": "Два самых важных дня в твоей жизни: день, когда ты появился на свет, и день, когда понял зачем.",
            "author": "Марк Твен",
            "category": "motivation",
        },
        {
            "text": "Никогда не поздно стать тем, кем тебе хочется быть.",
            "author": "Джордж Элиот",
            "category": "motivation",
        },
    ]
    
    def __init__(self, db: Database):
        self.db = db
    
    async def initialize_default_quotes(self) -> int:
        """
        Инициализировать базу цитат по умолчанию.
        
        Returns:
            int: Количество добавленных цитат
        """
        existing_count = len(await self.db.get_all_quotes())
        
        if existing_count > 0:
            logger.info(f"База цитат уже содержит {existing_count} записей")
            return 0
        
        added_count = 0
        for quote_data in self.DEFAULT_QUOTES:
            await self.db.create_quote(
                text=quote_data["text"],
                author=quote_data["author"],
                category=quote_data["category"],
            )
            added_count += 1
        
        logger.info(f"Добавлено {added_count} цитат по умолчанию")
        return added_count
    
    async def add_quote(
        self,
        text: str,
        author: Optional[str] = None,
        category: Optional[str] = None,
    ) -> Quote:
        """
        Добавить новую цитату.
        
        Args:
            text: Текст цитаты
            author: Автор (опционально)
            category: Категория (опционально)
            
        Returns:
            Quote: Созданная цитата
            
        Raises:
            ValueError: Если текст пустой
        """
        if not text or len(text.strip()) == 0:
            raise ValueError("Текст цитаты не может быть пустым")
        
        if len(text) > 5000:
            raise ValueError("Текст цитаты слишком длинный (максимум 5000 символов)")
        
        quote = await self.db.create_quote(
            text=text.strip(),
            author=author.strip() if author else None,
            category=category.strip() if category else None,
        )
        
        logger.info(f"Добавлена цитата ID={quote.id} от {author or 'анонима'}")
        return quote
    
    async def get_random_quote(self, category: Optional[str] = None) -> Optional[Quote]:
        """Получить случайную цитату."""
        return await self.db.get_random_quote(category)
    
    async def get_all_quotes(self) -> List[Quote]:
        """Получить все цитаты."""
        return await self.db.get_all_quotes()
    
    async def delete_quote(self, quote_id: int) -> bool:
        """
        Удалить цитату по ID.
        
        Примечание: В текущей реализации нет прямого метода удаления,
        можно добавить в repository при необходимости.
        """
        # TODO: Реализовать удаление цитаты
        logger.warning(f"Удаление цитаты {quote_id} еще не реализовано")
        return False
    
    async def get_quotes_by_category(self, category: str) -> List[Quote]:
        """Получить все цитаты категории."""
        all_quotes = await self.db.get_all_quotes()
        return [q for q in all_quotes if q.category == category and q.is_active]
    
    async def get_categories(self) -> List[str]:
        """Получить список всех категорий."""
        all_quotes = await self.db.get_all_quotes()
        categories = set(q.category for q in all_quotes if q.category and q.is_active)
        return sorted(list(categories))
