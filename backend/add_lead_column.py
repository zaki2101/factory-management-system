### СКРИПТ 
### Добавление поля lead, по умолчанию "-"

import sqlite3

def add_lead_column():
    """
    Скрипт для добавления поля lead в таблицу employees
    """
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    
    print("Добавление поля lead...")
    
    try:
        # Проверяем, существует ли колонка lead
        cursor.execute("PRAGMA table_info(employees)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'lead' in columns:
            print("✅ Колонка lead уже существует!")
        else:
            # Добавляем новую колонку со значением по умолчанию
            cursor.execute("ALTER TABLE employees ADD COLUMN lead TEXT DEFAULT '-'")
            print("✅ Колонка lead успешно добавлена!")
        
        conn.commit()
        print("Миграция завершена!")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    add_lead_column()



# Запуск в терминале (активация виртуальной среды не нужна)
# Запуск из текущей ветки (основной или тестовой)
# cd backend
# python3 add_lead_column.py