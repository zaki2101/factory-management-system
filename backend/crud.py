'''
Cодержит CRUD-операции — основные функции для работы с базой данных
CRUD = Create, Read, Update, Delete
Create — создание записей (create_item)
Read — чтение записей (get_items)
Update — обновление записей (будет позже)
Delete — удаление записей (будет позже)
'''

from sqlalchemy.orm import Session
import models
import schemas

# ТАБЛИЦА "ПРЕДПРИЯТИЯ"
# Функция для получения списка всех записей (с ограничением, пока использовать не будем)
def get_factories(db: Session, skip: int = 0, limit: int = 100):
    # query() — метод для создания запроса
    # models.Item — класс таблицы, с которой работаем
    # .offset() — метод пропуска записей
    return db.query(models.Factory).offset(skip).limit(limit).all()


# Функция для получения списка всех записей
def get_all_factories(db: Session):
    return db.query(models.Factory).all()


# Создать новую запись
def create_factory(db: Session, factory: schemas.FactoryCreate):
    db_factory = models.Factory(**factory.dict())
    db.add(db_factory)
    db.commit()
    db.refresh(db_factory)
    return db_factory


# Получить запись по ИНН
def get_factory_by_inn(db: Session, inn: str):
    return db.query(models.Factory).filter(models.Factory.inn == inn).first()


# Редактирование записи
def update_factory(db: Session, factory_id: int, factory_data: schemas.FactoryCreate):
    # Находим запись по ID
    db_factory = db.query(models.Factory).filter(models.Factory.id == factory_id).first()
    if not db_factory:
        return None
    
    # Обновляем все поля
    for field, value in factory_data.dict().items():
        setattr(db_factory, field, value)
    
    db.commit() # Сохранение в БД
    db.refresh(db_factory) # Обновляем объект из БД
    return db_factory

def get_factory_by_id(db: Session, factory_id: int):
    return db.query(models.Factory).filter(models.Factory.id == factory_id).first()

# Функция удаления предприятие из базы данных по ID
def delete_factory(db: Session, factory_id: int):
    """
    Args:
        db: Сессия базы данных
        factory_id: ID предприятия для удаления
    Returns:
        Удаленный объект Factory или None если не найден
    """
    db_factory = db.query(models.Factory).filter(models.Factory.id == factory_id).first()
    if db_factory:
        db.delete(db_factory)
        db.commit()
        return True
    return False

########################################################
# ТАБЛИЦА "СОТРУДНИКИ"

# Функция для получения всех сотрудников по ИНН фабрики
def get_employees_by_inn(db: Session, inn: str):
    return db.query(models.Employee).filter(models.Employee.inn == inn).all()

# Функция для получения конкретного сотрудника по его ID
def get_employee_by_id(db: Session, employee_id: int):
    return db.query(models.Employee).filter(models.Employee.id == employee_id).first()

# Функция для создания нового сотрудника
def create_employee(db: Session, employee: schemas.EmployeeCreate):
    db_employee = models.Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

# Функция для обновления данных сотрудника
def update_employee(db: Session, employee_id: int, employee_data: schemas.EmployeeCreate):
    db_employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not db_employee:
        return None
    
    for field, value in employee_data.dict().items():
        setattr(db_employee, field, value)
    
    db.commit()
    db.refresh(db_employee)
    return db_employee

# Функция для удаления сотрудника
def delete_employee(db: Session, employee_id: int):
    db_employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if db_employee:
        db.delete(db_employee)
        db.commit()
        return True
    return False

##############################################
# ТАБЛИЦА ВИДЫ ДЕЯТЕЛЬНОСТИ

# Функции для работы с видами деятельности
def get_activity_types(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ActivityType).offset(skip).limit(limit).all()

def get_activity_type_by_id(db: Session, activity_type_id: int):
    return db.query(models.ActivityType).filter(models.ActivityType.id == activity_type_id).first()

def create_activity_type(db: Session, activity_type: schemas.ActivityTypeCreate):
    db_activity_type = models.ActivityType(**activity_type.dict())
    db.add(db_activity_type)
    db.commit()
    db.refresh(db_activity_type)
    return db_activity_type

def delete_activity_type(db: Session, activity_type_id: int):
    db_activity_type = db.query(models.ActivityType).filter(models.ActivityType.id == activity_type_id).first()
    if db_activity_type:
        db.delete(db_activity_type)
        db.commit()
        return True
    return False

# Обновить данные вида деятельности
def update_activity_type(db: Session, activity_type_id: int, activity_type_data: schemas.ActivityTypeCreate):
    db_activity_type = db.query(models.ActivityType).filter(models.ActivityType.id == activity_type_id).first()
    if not db_activity_type:
        return None
    
    # Проверяем уникальность названия (кроме текущей записи)
    if activity_type_data.name != db_activity_type.name:
        existing = db.query(models.ActivityType).filter(
            models.ActivityType.name == activity_type_data.name
        ).first()
        if existing:
            return None  # Название уже занято
    
    # Обновляем поля
    for field, value in activity_type_data.dict().items():
        setattr(db_activity_type, field, value)
    
    db.commit()
    db.refresh(db_activity_type)
    return db_activity_type

#############################################################
# ТАБЛИЦА МЕНЕДЖЕРЫ
# Функции для работы со справочником Менеджеры

# Функция для получения списка всех записей
def get_all_managers(db: Session):
    return db.query(models.Manager).all()

def create_manager(db: Session, manager: schemas.ManagerCreate):
    db_manager = models.Manager(**manager.dict())
    db.add(db_manager)
    db.commit()
    db.refresh(db_manager)
    return db_manager

def delete_manager(db: Session, manager_id: int):
    db_manager = db.query(models.Manager).filter(models.Manager.id == manager_id).first()
    if db_manager:
        db.delete(db_manager)
        db.commit()
        return True
    return False

def update_manager(db: Session, manager_id: int, manager_data: schemas.ManagerCreate):
    db_manager = db.query(models.Manager).filter(models.Manager.id == manager_id).first()
    if not db_manager:
        return None
    
    # Проверяем уникальность фио (кроме текущей записи)
    if manager_data.manager_name != db_manager.manager_name:
        existing = db.query(models.Manager).filter(
            models.Manager.manager_name == manager_data.manager_name
        ).first()
        if existing:
            return None  # Название уже занято
    
    # Обновляем поля
    for field, value in manager_data.dict().items():
        setattr(db_manager, field, value)
    
    db.commit()
    db.refresh(db_manager)
    return db_manager

##########################################
# ТАБЛИЦА КОНТАКТЫ
# Все контакты

# функция обеспечивает данные для таблицы в модальном окне "Контакты"
def get_all_employees(db: Session):
    """
    Получить ВСЕХ сотрудников из таблицы employees
    Используется для модального окна "Контакты"
    """
    return db.query(models.Employee).all()