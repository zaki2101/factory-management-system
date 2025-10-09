

import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';  // ← Основной компонент
import { ColDef } from 'ag-grid-community';    // ← Типы для колонок
//import 'ag-grid-community/styles/ag-grid.css'; // ← Базовые стили
//import 'ag-grid-community/styles/ag-theme-quartz.css'; // ← Тема Quartz

import EmployeesModal from './EmployeesModal'; // Импортируем компонент модального окна 


import { ModuleRegistry, AllCommunityModule} from 'ag-grid-community';
import './App.css';

ModuleRegistry.registerModules([AllCommunityModule]);

interface FactoryTableProps {
  activityTypeNames: string[];  // Пропс со списком названий видов деятельности
  managerNames: string[];  // Пропс со списком менеджеров
}

interface Factory {
  id: number;
  manager: string;
  city: string;
  name: string;
  inn: string;
  address: string;
  n_empl: number;
  okved: string;
  type_factory: string;
  emails: string;
  website: string;
  phones: string;
  add_contacts: string;
  comment1: string;
  comment2: string;
  comment3: string;
  comment4: string;
  date_created: string;
}


const FactoryTable: React.FC<FactoryTableProps> = ({ activityTypeNames, managerNames  }) => {
  // хук состояния React
  // rowData — переменная, которая хранит текущие данные таблицы 
  // setRowData — функция для обновления этих данных
  // useState<Factory[]>([]) — инициализирует состояние:
    // <Factory[]> — тип данных: массив объектов Factory
    // [] — начальное значение: пустой массив
  const [rowData, setRowData] = useState<Factory[]>([]);

  const [loading, setLoading] = useState(true); // ← Статус загрузки
  const [error, setError] = useState<string | null>(null); // ← Ошибки

  // Состояние для модального окна сотрудников
  const [isEmployeesModalOpen, setIsEmployeesModalOpen] = useState(false);
  const [selectedFactoryInn, setSelectedFactoryInn] = useState<string>(''); // ИНН выбранной фабрики
  const [selectedFactoryName, setSelectedFactoryName] = useState<string>(''); // Название выбранной фабрики



  // Функция удаления
  const handleDelete = async (factoryId: number) => {
    if (!window.confirm('Вы уверены что хотите удалить это предприятие?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/factories/${factoryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Предприятие удалено!');
        window.location.reload();
      } else {
        alert('Ошибка при удалении');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка сети при удалении');
    }
  };  

  // Обработчик изменения ячейки
  const onCellValueChanged = async (params: any) => {

    // Если изменилось не поле INN - просто сохраняем
    if (params.column.colId !== 'inn') {
      await saveChanges(params.data);
      return;
    }

    // Если изменился INN - проверяем
    try {
      const checkResponse = await fetch(`http://localhost:8000/factories/inn/${params.data.inn}`);
      if (checkResponse.ok) {
        // ИНН уже существует - отменяем изменение
        alert('Предприятие с таким ИНН уже существует!');
        window.location.reload(); // ← Перезагружаем страницу
        return;
      }

      // ИНН свободен - сохраняем
      await saveChanges (params.data);

    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при проверке ИНН');
      window.location.reload(); // ← Перезагружаем при ошибке
    }
  
};

// Вынесем сохранение в отдельную функцию
const saveChanges = async (data: any) => {
  try {
    const response = await fetch(`http://localhost:8000/factories/${data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      // Если сервер вернул ошибку 
      //const errorData = await response.json();
      alert(`Ошибка сохранения. Недопустимое значение!`);
      window.location.reload(); // ← Перезагружаем при ЛЮБОЙ ошибке
      return;
    }

    console.log('Изменения сохранены:', data);
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    alert('Ошибка при сохранении изменений');
    window.location.reload();
  }
};

    
   
  //



  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch('http://localhost:8000/all-factories/')
      .then(response => {
        if (!response.ok) {
          throw new Error('Ошибка загрузки данных');
        }
        return response.json();
      })
      .then(data => {
        setRowData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Ошибка:', error);
        setError('Не удалось загрузить данные');
        setLoading(false);
      })  
  }, []);

  // Обработчик клика по кнопке "i"
  const handleInfoClick = (inn: string, name: string) => {
    setSelectedFactoryInn(inn); // Сохраняем ИНН выбранной фабрики
    setSelectedFactoryName(name); // Сохраняем название для заголовка модалки
    setIsEmployeesModalOpen(true); // Открываем модальное окно
  };


  // Показываем заглушки во время загрузки
  if (loading) {
    return <div className="loading">Загрузка данных...</div>;
  }

  if (error) {
    return <div className="error">Ошибка: {error}</div>;
  }


  const columnDefs: ColDef[] = [
    {
      field: 'actions',
      headerName: '❌',
      width: 60,
      cellRenderer: (params: any) => (
        <button 
          onClick={() => handleDelete(params.data.id)}
          className="delete-button"
        >✖️
        </button>
      ),
      sortable: false,
      filter: false,
      editable: false
    },

    { 
      field: 'manager', 
      headerName: 'Менеджер', 
      width: 120, 
      sortable: true, 
      filter: true,
      editable: true,
      cellEditor: 'agSelectCellEditor',        // ← Выпадающий список
      cellEditorParams: {
        values: managerNames                   // ← Из справочника менеджеров
      }
    },

    {
      field: 'type_factory', 
      headerName: 'ВИД ДЕЯТЕЛЬНОСТИ', 
      cellEditor: 'agSelectCellEditor',
      sortable: true, 
      filter: true,
      cellEditorParams: {
      values: activityTypeNames  // ← Уже готовый массив строк
      },
    },

    { field: 'city', headerName: 'Город', width: 100 },

    // НКнопка "i" для просмотра сотрудников
    {
      headerName: '👥', // Заголовок-иконка
      width: 60,
      cellRenderer: (params: any) => (
        <button
          onClick={() => handleInfoClick(params.data.inn, params.data.name)}
          className="info-button"
          title="Сведения о сотрудниках" // Всплывающая подсказка
        >
          ⓘ
        </button>
      ),
      sortable: false,
      filter: false,
      editable: false
    },

    { field: 'name', headerName: 'Наименование предприятия', width: 200, filter: true },
    { field: 'inn', headerName: 'ИНН', width: 120, filter: true },
    { field: 'address', headerName: 'Адрес', width: 200 },
    { field: 'n_empl', headerName: 'Кол-во сотр', width: 50 },
    { field: 'okved', headerName: 'ОКВЭД', width: 100, filter: true },
    { field: 'emails', headerName: 'Email', width: 150 },
    { field: 'website', headerName: 'Сайт', width: 100 },
    { field: 'phones', headerName: 'Телефоны', width: 120 },
    { field: 'add_contacts', headerName: 'Доп. контакты', width: 150 },
    { field: 'comment1', headerName: 'Комментарий 1', width: 150 },
    { field: 'comment2', headerName: 'Комментарий 2', width: 150 },
    { field: 'comment3', headerName: 'Комментарий 3', width: 150 },
    { field: 'date_created', headerName: 'Дата записи', width: 130, 
      sortable: true, filter: true, editable: false }
    //{ field: 'comment4', headerName: 'Комментарий 4', width: 150 },
    
  ];

  /* sortable: false  Запретить сортировку 
   filter: false  Запретить фильтрацию 
   resizable: false  Запретить изменение ширины
   minWidth: 200  Минимальная ширина
   maxWidth: 400  Максимальная ширина
   flex: 2. В 2 раза шире других колонок
   tooltipField: 'description'. Подсказка при наведении */

  return ( 
    <> {/*возвращается два элемента на одном уровне: таблица и модальное окно*/ }
      <div 
        className="ag-theme-quartz" 
          style={{ 
            height: '100vh',         // 100% высоты экрана
            width: '100%',          // Вся доступная ширина
            //margin: '0 auto',
            overflow: 'auto',        // полосы прокрутки
            marginBottom: '15px'     // отступ снизу
          }}
      >

      <AgGridReact  // общие характеристики, могут быть переопределены для каждого поля
        rowData={rowData}
        columnDefs={columnDefs}
        rowHeight={25}  // Высота всех строк
        onCellValueChanged={onCellValueChanged} // Обработчик изменения значения ячейки (автосохранение) 
        domLayout="normal"                    // Стандартный layout с прокруткой
        suppressHorizontalScroll={false}      // Разрешить горизонтальную прокрутку ✅
        enableCellTextSelection={true}        // Можно выделять текст
        ensureDomOrder={true}                 // Оптимизация производительности
        defaultColDef={{                      // Настройки по умолчанию для ВСЕХ колонок
          //sortable: true,                     // Сортировка для всех колонок ✅
          //filter: true,                       // Фильтрация для всех колонок ✅
          resizable: true,                    // Изменение ширины для всех колонок ✅
          editable: true,                     // ← Включаем редактирование для всех колонок
          singleClickEdit: true,               // ← Редактирование по одному клику
          //floatingFilter: false,               // Поля фильтра над заголовками
          //minWidth: 100,                      // Минимальная ширина колонки
          //flex: 1,                            // Гибкое растяжение
          cellStyle: { border: '1px solid #ddd' } //   вертикальная разметка
        }}
        
        stopEditingWhenCellsLoseFocus={true}  // Сохранять при потере фокуса
      />
    </div>
    
    {/* Условный рендеринг модального окна сотрудников */}
    {/* Хранит ИНН предприятия, для которого нужно показать сотрудников */}
    {/* Хранит название предприятия */}
    {isEmployeesModalOpen && (
      <EmployeesModal
        factoryInn={selectedFactoryInn}   
        factoryName={selectedFactoryName} 
        onClose={() => setIsEmployeesModalOpen(false)}
      />
      )}
    </>


  );
};

export default FactoryTable;
export type { Factory };  // ← Явно экспортируем тип