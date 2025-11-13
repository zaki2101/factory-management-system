"""
Скрипт для добавления полей авторизации в таблицу managers:
- login 
- password 
- role (admin/user)
"""
import sqlite3

def add_auth_fields_to_managers():
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    
    print("Добавляем поля авторизации в managers...")
    
    try:
        # Проверяем существующие колонки
        cursor.execute("PRAGMA table_info(managers)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Добавляем login если нет
        if 'login' not in columns:
            cursor.execute("ALTER TABLE managers ADD COLUMN login TEXT")
            print("✅ Колонка login добавлена")
        
        # Добавляем password если нет  
        if 'password' not in columns:
            cursor.execute("ALTER TABLE managers ADD COLUMN password TEXT")
            print("✅ Колонка password добавлена")
            
        # Добавляем role если нет
        if 'role' not in columns:
            cursor.execute("ALTER TABLE managers ADD COLUMN role TEXT DEFAULT 'user'")
            print("✅ Колонка role добавлена")
        
        # Показываем новую структуру
        cursor.execute("PRAGMA table_info(managers)")
        print("\nСтруктура таблицы managers:")
        for column in cursor.fetchall():
            print(f"  - {column[1]} ({column[2]})")
            
        conn.commit()
        print("\n✅ Поля авторизации добавлены!")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    add_auth_fields_to_managers()

# Запуск в терминале (активация виртуальной среды не нужна)
# Запуск из текущей ветки (основной или тестовой)
# cd backend
# python3 add_columns_for_authorization.py