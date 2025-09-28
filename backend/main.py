# ядро приложения (роуты и зависимоти) - обработка HTTP запросов

# Стандартные библиотеки Python
from datetime import datetime
import io
from typing import Optional

# FastAPI и зависимости
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware  
#from fastapi.responses import FileResponse
from fastapi.responses import Response
from sqlalchemy.orm import Session

# Сторонние библиотеки
from openpyxl import Workbook

# Наши модули
import models, schemas, crud
from database import SessionLocal, engine



# Создаем таблицы в базе данных
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Настройки CORS
# разрешаем запросы от React
app.add_middleware(
    CORSMiddleware,
    #allow_origins=["*"],
    allow_origins=["http://localhost:3000"],  # Адрес React-приложения
    allow_credentials=True,
    allow_methods=["*"], 
    # allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  
    allow_headers=["*"],  # Разрешаем все заголовки
)


# Функция для получения сессии БД
def get_db():
    # Создается новая сессия БД для каждого запроса
    # Каждый пользователь получает собственную изолированную сессию
    db = SessionLocal() 

    try:
        yield db # возвращает сессию в route-функцию и замораживает выполнение
    finally:
        db.close() # Закрывает сессию и возвращает соединение в пул

# ТАБЛИЦА "ПРЕДПРИЯТИЯ"
# GET все записи с лимитом
@app.get("/factories/", response_model=list[schemas.Factory])
def read_factories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    factories = crud.get_factories(db, skip=skip, limit=limit)
    return factories

# GET все записи
@app.get("/all-factories/", response_model=list[schemas.Factory])
def read_all_factories(db: Session = Depends(get_db)):
    factories = crud.get_all_factories(db)
    return factories

# POST создать новую запись
@app.post("/factories/", response_model=schemas.Factory)
def create_factory(factory: schemas.FactoryCreate, db: Session = Depends(get_db)):
    # Проверяем уникальность ИНН
    db_factory = crud.get_factory_by_inn(db, inn=factory.inn)
    if db_factory:
        raise HTTPException(status_code=400, detail="Предприятие с таким ИНН уже введено!")
    return crud.create_factory(db=db, factory=factory)

## Поиск записи по ИНН
#@app.get("/factories/inn/{inn}", response_model=schemas.Factory)
#def read_factory_by_inn(inn: str, db: Session = Depends(get_db)):
#    db_factory = crud.get_factory_by_inn(db, inn=inn)
#    if db_factory is None:
#        raise HTTPException(status_code=404, detail="Предприятие не найдено")
#    return db_factory


# Редактирование
# FastAPI принимает запрос от обработчика ячейки в AG Grid 
#  после CRUD функция обновляет запись
@app.put("/factories/{factory_id}", response_model=schemas.Factory)
def update_factory(
    factory_id: int, 
    factory: schemas.FactoryCreate, 
    db: Session = Depends(get_db)
):
    # Проверяем уникальность ИНН (кроме текущей записи)
    existing_factory = crud.get_factory_by_inn(db, inn=factory.inn)
    if existing_factory and existing_factory.id != factory_id:
        raise HTTPException(status_code=400, detail="Factory with this INN already exists")
    
    # Обновляем запись
    updated_factory = crud.update_factory(db, factory_id=factory_id, factory_data=factory)
    if updated_factory is None:
        raise HTTPException(status_code=404, detail="Factory not found")
    
    return updated_factory

# Обрабатывает DELETE запрос для удаления предприятия
@app.delete("/factories/{factory_id}")
def delete_factory(factory_id: int, db: Session = Depends(get_db)):
    """
    Args:
        factory_id: ID предприятия из URL пути
        db: Сессия базы данных (автоматически внедряется) 
    Returns:
        Сообщение об успешном удалении или ошибку 404
    Raises:
        HTTPException 404: Если предприятие с указанным ID не найдено
    """
    db_factory = crud.get_factory_by_id(db, factory_id=factory_id)
    if not db_factory:
        raise HTTPException(status_code=404, detail="Factory not found")
    
    crud.delete_factory(db, factory_id=factory_id)
    return {"message": "Factory deleted successfully"}


# эндпоинт для экспорта предприятий в файл EXCEL
@app.get("/export/factories/excel")
def export_factories_to_excel(
    start_date: Optional[str] = None,  # ← Параметры фильтрации
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    
    """
    Экспорт фабрик в Excel с поддержкой фильтрации по дате
    """
    try:
        print(f"Экспорт с фильтрами: start_date={start_date}, end_date={end_date}")
        
        # 1. Получаем данные из базы с учетом фильтров
        query = db.query(models.Factory) # аналогично - "SELECT * FROM factories"

        # Применяем фильтры по дате, если они указаны
        if start_date:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(models.Factory.date_created >= start_date_obj)
            # запрос - "SELECT * FROM factories WHERE date_created >= '2024-01-01'

        # Добавляем второй фильтр    
        if end_date: 
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(models.Factory.date_created <= end_date_obj)
            # запрос - "SELECT * FROM factories WHERE date_created >= '2024-01-01' AND date_created <= '2024-01-31'"
        
        factories = query.all() # Выполняет финальный SQL и возвращает результаты
        print(f"Найдено фабрик после фильтрации: {len(factories)}")
        
        # 2. Создаем Excel книгу в памяти
        wb = Workbook()
        ws = wb.active
        ws.title = "Фабрики"
    
        # 3. Заголовки колонок
        headers = [ "Название", "ИНН",  "Адрес", "Город", "Менеджер", "Вид деятельности",   
                    "ОКВЭД", "Сайт", "Email", "Телефоны", "Доп. Контакты", "К-во сотр", 
                    "Комментарий 1", "Комментарий 2", "Комментарий 3", "Дата записи"]
        ws.append(headers)
    
        # 4. Данные
        for factory in factories:
            ws.append([
                factory.name,
                factory.inn,
                factory.address,
                factory.city or "",
                factory.manager,
                factory.type_factory,
                factory.okved,
                factory.website or "",
                factory.emails or "",
                factory.phones or "",
                factory.add_contacts or "",
                factory.n_empl or "",
                factory.comment1 or "",
                factory.comment2 or "",
                factory.comment3 or "",
                str(factory.date_created) if factory.date_created else ""
            ])
        # 5. Сохраняем в память (не в файл на сервере)
        excel_buffer = io.BytesIO()
        wb.save(excel_buffer)
        excel_buffer.seek(0)  # Перемещаемся в начало буфера

        # 6. Формируем имя файла с учетом фильтров
        filename = f"fabriki_export_{datetime.now().strftime('%Y-%m-%d')}"
        if start_date or end_date:
            filename += "_filtered"
        filename += ".xlsx"
    
        # 7. Возвращаем файл для скачивания
        return Response(
            content=excel_buffer.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    except Exception as e:
        print(f"ОШИБКА В ЭКСПОРТЕ: {e}")
        raise HTTPException(status_code=500, detail=str(e))

##########################################

# ТАБЛИЦА "СОТРУДНИКИ"

# Эндпоинт для получения ВСЕХ сотрудников конкретной фабрики по её ИНН
'''
/factories/{inn}/employees - {inn} в пути URL — это path parameter. 
Именно так мы указываем, для какой фабрики нужны сотрудники
'''
@app.get("/factories/{inn}/employees", response_model=list[schemas.Employee])
def read_employees_by_factory(inn: str, db: Session = Depends(get_db)):
    """
    Получить список всех сотрудников предприятия по его ИНН
    Важно: ИНН берется из пути URL (path parameter)
    """
    # Сначала можно добавить проверку, что фабрика с таким ИНН вообще существует
    db_factory = crud.get_factory_by_inn(db, inn=inn)
    if not db_factory:
        raise HTTPException(status_code=404, detail="Factory not found")
    
    employees = crud.get_employees_by_inn(db, inn=inn)
    return employees # Возвращает список сотрудников или пустой список


# Эндпоинт для добавления НОВОГО сотрудника
@app.post("/employees/", response_model=schemas.Employee)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    """
    Создать нового сотрудника.
    Важно: В теле запроса (JSON) обязательно должен быть передан inn существующей фабрики.
    """
    # Проверяем, существует ли фабрика с таким ИНН, перед добавлением сотрудника
    db_factory = crud.get_factory_by_inn(db, inn=employee.inn)
    if not db_factory:
        raise HTTPException(status_code=404, detail="Factory with this INN not found")
    
    return crud.create_employee(db=db, employee=employee)

# Эндпоинт для ОБНОВЛЕНИЯ данных сотрудника
@app.put("/employees/{employee_id}", response_model=schemas.Employee)
def update_employee(
    employee_id: int, 
    employee_data: schemas.EmployeeCreate, 
    db: Session = Depends(get_db)
):
    """
    Обновить данные сотрудника по его ID.
    Важно: Если в employee_data передан новый inn, он также будет проверен на существование.
    """
    # Проверяем, существует ли фабрика с новым ИНН (если inn был изменен)
    db_factory = crud.get_factory_by_inn(db, inn=employee_data.inn)
    if not db_factory:
        raise HTTPException(status_code=404, detail="Factory with this INN not found")
    
    # Обновляем запись
    updated_employee = crud.update_employee(db, employee_id=employee_id, employee_data=employee_data)
    if updated_employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    return updated_employee

# Эндпоинт для УДАЛЕНИЯ сотрудника
@app.delete("/employees/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    """
    Удалить сотрудника по его ID.
    """
    success = crud.delete_employee(db, employee_id=employee_id)
    if not success:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee deleted successfully"}


