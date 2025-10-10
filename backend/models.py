# Описывает структуру таблиц (SQLAlchemy модели)

from sqlalchemy import Column, Integer, String, ForeignKey, Date
from datetime import date
from sqlalchemy.orm import relationship
from database import Base


class Factory(Base):  # Таблица "Предприятия"
    __tablename__ = "factories"  #  название таблицы
    
    id = Column(Integer, primary_key=True)
    manager = Column(String, index=True)
    city = Column(String, nullable=True)
    name = Column(String)
    inn = Column(String, index=True, unique=True)
    address = Column(String)
    n_empl = Column(Integer, nullable=True)
    okved = Column(String)
    type_factory = Column(String)
    emails = Column(String, nullable=True)
    website = Column(String, nullable=True)
    phones = Column(String, nullable=True)
    add_contacts = Column(String, nullable=True)
    comment1 = Column(String, nullable=True)
    comment2 = Column(String, nullable=True)
    comment3 = Column(String, nullable=True)
    comment4 = Column(String, nullable=True)
    date_created = Column(Date, default=date.today)
    at_work = Column(String, nullable=True)


class Employee(Base):  # Таблица "Сотрудники" (Контакты)
    __tablename__ = "employees"  # Название таблицы
    
    id = Column(Integer, primary_key=True)

    # Внешний ключ на таблицу factories, поле inn
    # ForeignKey('factories.inn') - поле inn в этой таблице ссылается на поле inn в таблице factories
    inn = Column(String, ForeignKey('factories.inn'), nullable=False, index=True)
    name_factory = Column(String, nullable=False)
    employee = Column(String, nullable=False)  # ФИО (обязательное поле)
    position = Column(String)                   # Должность
    phone = Column(String)                      # Телефон
    email = Column(String)                      # Эл.почта
    comment1 = Column(String, nullable=True)    # Комментарий 1
    comment2 = Column(String, nullable=True)    # Комментарий 2
    comment3 = Column(String, nullable=True)    # Комментарий 3
    lead = Column(String, default="-")          # ЛИД "+" или "-"


class ActivityType(Base):  # Модель "Виды деятельности"
    __tablename__ = "activity_types"  # Название таблицы
    
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)  # Название вида деятельности
    description = Column(String, nullable=True)         # Описание 


class Manager(Base):  # Модель "Менеджеры"
    __tablename__ = "managers"  # Название таблицы
    
    id = Column(Integer, primary_key=True)
    manager_name = Column(String, unique=True, nullable=False)  
    manager_phone = Column(String, nullable=True)
    manager_email = Column(String, nullable=True)  
    manager_comment = Column(String, nullable=True)         


    '''
    primary_key=
    index=
    unique=
    nullable=
    '''