# Скрипт для создания новой колонки в БД Фабрики
import sqlite3
from datetime import date

def migrate_database():
    # Подключаемся к базе
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    
    print("Подключение к базе данных...")
    
    try:
        # Проверяем, существует ли уже колонка
        cursor.execute("PRAGMA table_info(factories)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'date_created' in columns:
            print("Колонка date_created уже существует!")
        else:
            # Добавляем новую колонку
            cursor.execute("ALTER TABLE factories ADD COLUMN date_created DATE")
            print("Колонка date_created добавлена успешно!")
            
            # Устанавливаем текущую дату для существующих записей
            cursor.execute("UPDATE factories SET date_created = ?", (date.today().isoformat(),))
            print("Дата установлена для существующих записей!")
        
        # Проверяем изменения
        cursor.execute("SELECT id, name, date_created FROM factories LIMIT 3")
        sample_data = cursor.fetchall()
        print("Пример данных:")
        for row in sample_data:
            print(f"ID: {row[0]}, Name: {row[1]}, Date: {row[2]}")
            
        conn.commit()
        print("Миграция завершена успешно!")
        
    except Exception as e:
        print(f"Ошибка при миграции: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()


# Запуск в терминале
# cd backend
# python migrate.py