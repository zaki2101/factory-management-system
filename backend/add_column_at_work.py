''' Скрипт для добавления поля at_work в таблицу factories
✅ Проверит существование колонки
✅ Добавит at_work  TEXT если её нет
✅ Покажет новую структуру таблицы
'''
import sqlite3

def add_column_at_work():

    # Подключаемся к базе данных
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    
    print("Подключение к базе данных...")
    
    try:
        # Проверяем, существует ли уже колонка name_factory
        cursor.execute("PRAGMA table_info(factories)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'at_work' in columns:
            print("✅ Колонка  уже существует!")
        else:
            # Добавляем новую колонку
            cursor.execute("ALTER TABLE factories ADD COLUMN at_work TEXT")
            print("✅ Колонка  успешно добавлена!")
        
        # Показываем структуру таблицы после изменений
        cursor.execute("PRAGMA table_info(factories)")
        print("\nСтруктура таблицы factories:")
        for column in cursor.fetchall():
            print(f"  - {column[1]} ({column[2]})")
            
        conn.commit()
        print("\n✅ Миграция завершена успешно!")
        
    except Exception as e:
        print(f"❌ Ошибка при миграции: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    add_column_at_work()


# Запуск в терминале (активация виртуальной среды не нужна)
# Запуск из текущей ветки (основной или тестовой)
# cd backend
# python3 add_column_at_work.py