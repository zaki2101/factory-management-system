# Подключение к БД и настройка сессий

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL для подключения к базе данных (пока используем SQLite для простоты)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# Создаем "движок" - точку подключения к БД
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Создаем фабрику для сессий работы с БД
# SessionLocal - создает конкретную сессию для одного запроса
# sessionmaker() создает фабрику сессий - шаблон для создания одинаковых сессий

''' Настройки контроля над транзакциями
autocommit=False - изменения не сохраняются автоматически (только через через db.commit(), 
иначе каждое изменение сразу сохраняется в БД (опасно!))

autoflush=False - не отправлять команды автоматически

bind=engine - привязка к конкретной базе данных
'''
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)



# Базовый класс для всех наших будущих моделей (таблиц) создает базовый класс с метаданными
Base = declarative_base()



