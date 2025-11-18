# Подключение к БД и настройка сессий# Базовый класс для всех наших будущих моделей (таблиц) создает базовый класс с метаданными

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker 
from dotenv import load_dotenv

# Загружаем переменные окружения из .env файла
load_dotenv()

# URL базы данных PostgreSQL из переменной окружения
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Создаем движок PostgreSQL
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для всех наших будущих моделей (таблиц) создает базовый класс с метаданными
Base = declarative_base()