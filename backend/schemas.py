# валидация данных (Pydantic-схемы )
'''
Решает КРИТИЧЕСКИ важную задачу: обеспечивает безопасность и валидацию данных
Валидация данных — проверяет, что фронтенд прислал данные в правильном формате
Сериализация — преобразует данные из БД в JSON для фронтенда
Безопасность — определяет какие поля можно принимать/возвращать
'''

from pydantic import BaseModel, Field
from typing import Optional  # для указания необязательных полей, которые могут быть None

from typing import Literal
from pydantic import validator
from datetime import date


# Схема для создания новой записи
class FactoryCreate(BaseModel):
    manager: str
    city: str
    name: str
    inn: str 
    address: str
    n_empl: Optional[int] = None
    okved: str
    type_factory: str  # Пока просто строка
    emails: Optional[str] = None
    website: Optional[str] = None
    phones: Optional[str] = None
    add_contacts: Optional[str] = None
    comment1: Optional[str] = None
    comment2: Optional[str] = None
    comment3: Optional[str] = None
    comment4: Optional[str] = None
    date_created: Optional[date] = None


    #@validator('type_factory')
    #def validate_type_factory(cls, v):
        #allowed_values = ['ПРОЕКТИРОВАНИЕ', 'ХИМИЯ', 'ФАРМАЦЕВТИКА']
        #if v not in allowed_values:
        #    raise ValueError(f'Тип производства должен быть одним из: {allowed_values}')
        #return 

# Схема для возврата данных из БД
class Factory(FactoryCreate):
    id: int
    #date_created: str  # ← Обязательное при возврате

    class Config:
        from_attributes = True


# Схема для создания нового сотрудника
class EmployeeCreate(BaseModel):
    inn: str           # ИНН фабрики, к которой привязываем сотрудника
    name_factory: str
    employee: str      # ФИО (обязательное поле)
    position: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    comment1: Optional[str] = None
    comment2: Optional[str] = None
    comment3: Optional[str] = None


# Схема для возврата данных о сотруднике из БД
class Employee(EmployeeCreate):
    id: int            # Добавляем автоматический ID
    
    class Config:
        from_attributes = True  # Ранее called ORM mode


# Схемы для справочника "Виды деятельности"
class ActivityTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ActivityType(ActivityTypeCreate):
    id: int
    
    class Config:
        from_attributes = True


# Схемы для справочника "Менеджеры"
class ManagerCreate(BaseModel):
    manager_name: str
    manager_phone: Optional[str] = None
    manager_email: Optional[str] = None
    manager_comment: Optional[str] = None

class Manager(ManagerCreate):
    id: int
    
    class Config:
        from_attributes = True