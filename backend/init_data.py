# Скрипт для инициализации справочника "Виды деятельности" начальными данными

from database import SessionLocal
import models

def init_activity_types():
    db = SessionLocal()
    
    # Стандартные виды деятельности
    default_activities = [
        {"name": "ПРОЕКТИРОВАНИЕ", "description": "Проектирование оборудования"},
        {"name": "ХИМИЯ", "description": "Химическое производство"},
        {"name": "ФАРМАЦЕВТИКА", "description": "Фармацевтическая промышленность"},
    ]
    
    for activity_data in default_activities:
        # Проверяем, существует ли уже такой вид деятельности
        existing = db.query(models.ActivityType).filter(
            models.ActivityType.name == activity_data["name"]
        ).first()
        
        if not existing:
            activity_type = models.ActivityType(**activity_data)
            db.add(activity_type)
    
    db.commit()
    db.close()
    print("Справочник видов деятельности инициализирован")

if __name__ == "__main__":
    init_activity_types()

'''
запуск

cd backend
python init_data.py
'''    