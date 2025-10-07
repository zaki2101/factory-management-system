''' Скрипт для добавления поля name_factory в таблицу employees
✅ Проверит существование колонки
✅ Добавит name_factory TEXT если её нет
✅ Покажет новую структуру таблицы
'''
import sqlite3

def add_factory_name_column():

    # Подключаемся к базе данных
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    
    print("Подключение к базе данных...")
    
    try:
        # Проверяем, существует ли уже колонка name_factory
        cursor.execute("PRAGMA table_info(employees)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'name_factory' in columns:
            print("✅ Колонка name_factory уже существует!")
        else:
            # Добавляем новую колонку
            cursor.execute("ALTER TABLE employees ADD COLUMN name_factory TEXT")
            print("✅ Колонка name_factory успешно добавлена!")
        
        # Показываем структуру таблицы после изменений
        cursor.execute("PRAGMA table_info(employees)")
        print("\nСтруктура таблицы employees:")
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
    add_factory_name_column()


# Запуск в терминале (активация виртуальной среды не нужна)
# Запуск из текущей ветки (основной или тестовой)
# cd backend
# python3 add_factory_name_column.py