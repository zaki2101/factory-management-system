
import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';  // ← Таблицы
import { ColDef } from 'ag-grid-community';    // ← Типы для колонок
import * as XLSX from 'xlsx';  // Библиотека для работы с Excel файлами (экспорт/импорт)

//import 'ag-grid-community/styles/ag-grid.css'; // ← Базовые стили
//import 'ag-grid-community/styles/ag-theme-quartz.css'; // ← Тема Quartz

import EmployeesModal from './EmployeesModal'; // Импортируем компонент модального окна 
import AddFactoryModal from './AddFactoryModal'; // Импортируем компонент модального окна добавления фабрики

import { RU_LOCALE_TEXT } from './agGridRussian'; // Русская локализация для AG Grid

import { ModuleRegistry, AllCommunityModule} from 'ag-grid-community';
import './App.css';

ModuleRegistry.registerModules([AllCommunityModule]);

interface FactoryTableProps {
  activityTypeNames: string[];  // Пропс со списком названий видов деятельности
  managerNames: string[];  // Пропс со списком менеджеров

  // пропсы для модальных окон
  onOpenActivityTypesModal: () => void;
  onOpenManagersModal: () => void;
  onOpenContactsModal: () => void;
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
  at_work: string;
  date_in_work: string | null;
}

  /* хук состояния React
  // rowData — переменная, которая хранит текущие данные таблицы (локальные данные, которые уже загружены в память браузера)
  // setRowData — функция для обновления этих данных
  // useState<Factory[]>([]) — инициализирует состояние:
  // <Factory[]> — тип данных: массив объектов Factory
  // [] — начальное значение: пустой массив
  */
const FactoryTable: React.FC<FactoryTableProps> = ({ 
  activityTypeNames, 
  managerNames,
  onOpenActivityTypesModal, 
  onOpenManagersModal,
  onOpenContactsModal
  }) => {

  const [rowData, setRowData] = useState<Factory[]>([]);

  const [loading, setLoading] = useState(true); // ← Статус загрузки
  const [error, setError] = useState<string | null>(null); // ← Ошибки

  // Состояние для модального окна сотрудников
  const [isEmployeesModalOpen, setIsEmployeesModalOpen] = useState(false);
  const [selectedFactoryInn, setSelectedFactoryInn] = useState<string>(''); // ИНН выбранной фабрики
  const [selectedFactoryName, setSelectedFactoryName] = useState<string>(''); // Название выбранной фабрики

  /* useRef - это хук React, который создает "ссылку" на DOM-элемент или значение (ссылку на таблицу)
  Без useRef мы не можем "достучаться" до внутренних методов AG Grid
  useRef дает нам доступ к специальным функциям AG Grid, которые не доступны через обычные пропсы
  Для изменения цвета строки при изменении поля at_work
  */
  const gridRef = useRef<AgGridReact>(null); // Создаем "пульт" для управления таблицей

  /* Состояния для модального окна добавления фабрики
   * isAddModalOpen хранит true/false (открыто/закрыто окно)
   * setIsAddModalOpen меняет это значение */
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);


  // Функция добавления новой фабрики
  const handleAddFactory = async (newFactory: Omit<Factory, 'id'>) => {setIsLoading(true);
    try {
      // 1. Проверяем ИНН
      const checkResponse = await fetch(`http://localhost:8000/factories/inn/${newFactory.inn}`);
    
      if (checkResponse.ok) {
        // ИНН существует - ошибка
        alert('Предприятие с таким ИНН уже существует!');
        return;
      }
    
      // 2. ИНН свободен - сохраняем фабрику
      const saveResponse = await fetch('http://localhost:8000/factories/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFactory)
      });
    
      if (saveResponse.ok) {
        console.log('Предприятие добавлено:');
        await refreshTableData();
        setIsAddModalOpen(false);
      } else {
        alert('Ошибка при сохранении предприятия');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при добавлении предприятия');
    } finally {
      setIsLoading(false);
    }
  };


  // Функция экспорта текущего отфильтрованного вида в Excel
  const handleExportCurrentView = async () => {
    try {
      // Проверяем что таблица готова
      if (!gridRef.current) {
        alert('Таблица не готова для экспорта');
        return;
      }

      // Получаем ОТФИЛЬТРОВАННЫЕ и ОТСОРТИРОВАННЫЕ данные
      const filteredNodes = gridRef.current.api.getRenderedNodes();
      const filteredData = filteredNodes.map(node => node.data);

      // Если нет данных для экспорта
      if (filteredData.length === 0) {
        alert('Нет данных для экспорта');
        return;
      }

      // ПРЕОБРАЗУЕМ ДАННЫЕ: заменяем английские ключи на русские названия
      const dataWithRussianHeaders = filteredData.map(factory => ({
        'Менеджер': factory.manager,
        'В работе': factory.at_work,
        'Вид деятельности': factory.type_factory,
        'Город': factory.city,
        'Наименование предприятия': factory.name,
        'ИНН': factory.inn,
        'Адрес': factory.address,
        'Кол-во сотрудников': factory.n_empl,
        'ОКВЭД': factory.okved,
        'Email': factory.emails,
        'Сайт': factory.website,
        'Телефоны': factory.phones,
        'Доп. контакты': factory.add_contacts,
        'Комментарий 1': factory.comment1,
        'Комментарий 2': factory.comment2,
        'Комментарий 3': factory.comment3,
        'Дата записи': factory.date_created
      }));

      // Создаем Excel с русскими заголовками
      const worksheet = XLSX.utils.json_to_sheet(dataWithRussianHeaders);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Предприятия");
    
      // Формируем имя файла с текущей датой
      const fileName = `fabriki_${new Date().toISOString().split('T')[0]}.xlsx`;
    
      // Скачиваем файл
      XLSX.writeFile(workbook, fileName);
    
      console.log('Успешно экспортировано записей:', filteredData.length);
    
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      alert('Ошибка при экспорте в Excel');
    }
  };


  // Функция для обновления данных таблицы (внутренняя функция)
  const refreshTableData = async () => {
    try {
      const response = await fetch('http://localhost:8000/all-factories/');
      if (response.ok) {
        const data = await response.json();
        setRowData(data);
      }
    } catch (error) {
      console.error('Ошибка обновления данных:', error);
    }
  };


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
        //window.location.reload(); // перезагрузка
        await refreshTableData();  // Обновляем таблицу без перезагрузки страницы
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

      /* Если изменено поле 'at_work' и ссылка на таблицу существует 
      (gridRef инициализирован (таблица готова)) */
      if (params.column.colId === 'at_work' && gridRef.current) {
        /* Вызываем метод AG Grid для принудительной перерисовки всех строк
         Это заставляет пересчитать условные стили (красный цвет для 'ДЦ') */
        gridRef.current.api.redrawRows();
      }

      return;
    }

    // Если изменился INN - проверяем
    try {
      const checkResponse = await fetch(`http://localhost:8000/factories/inn/${params.data.inn}`);
      if (checkResponse.ok) {
        // ИНН уже существует - отменяем изменение
        alert('Предприятие с таким ИНН уже существует!');
        //window.location.reload(); // ← Перезагружаем страницу
        await refreshTableData();  // Обновляем таблицу без перезагрузки страницы
        return;
      }

      // ИНН свободен - сохраняем
      await saveChanges (params.data);

    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при проверке ИНН');
      //window.location.reload(); // ← Перезагружаем при ошибке
      await refreshTableData();  // Обновляем таблицу без перезагрузки страницы
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
        //window.location.reload(); // ← Перезагружаем при ЛЮБОЙ ошибке
        await refreshTableData();  // Обновляем таблицу без перезагрузки страницы
        return;
      }

      console.log('Изменения сохранены:', data);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка при сохранении изменений');
      //window.location.reload();
      await refreshTableData();  // Обновляем таблицу без перезагрузки страницы
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
      editable: true, // включает редактирование
      cellEditor: 'agSelectCellEditor',        // ← Выпадающий список
      cellEditorParams: {
        values: managerNames                   // ← Из справочника менеджеров
      }
    },

    { 
      field: 'at_work', 
      headerName: 'В работе', 
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
      field: 'date_in_work', 
      headerName: 'Закр. до', 
      width: 120, 
      sortable: true, 
      filter: true,
      editable: true
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
      headerName: 'ℹ️ ', // Заголовок-иконка
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
    {/* ШАПКА С ЗАГОЛОВКОМ И ВСЕМИ КНОПКАМИ */}
    <div className="header">
      {/* Заголовок */}
      <h2 style={{ margin: 0, color: '#333' }}>Сегмент Фабрика</h2>

      {/* Группа кнопок */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {/* Кнопка добавления предприятия */}
        <button 
          className="factory-button"
          onClick={() => setIsAddModalOpen(true)}  // ← открывает модалку в FactoryTable
        >
          🏢 Добавить предприятие
        </button>

        {/* Кнопка справочника видов деятельности */}
        <button 
          className="directory-button"
          onClick={onOpenActivityTypesModal}
          title="Справочник Виды деятельности"
        >
         🛠️ Виды деятельности
        </button>

        {/* Кнопка справочника менеджеров */}
        <button 
          className="directory-button"
          onClick={onOpenManagersModal}
          title="Справочник Менеджеры" 
        >
          👤👤 Менеджеры
        </button>

        {/* Кнопка контактов */}
        <button className="contacts-button" 
          onClick={onOpenContactsModal} >
          📞 Контакты
        </button>

        {/* КНОПКА ЭКСПОРТА */}
        <button className="factory-button" onClick={handleExportCurrentView} >
           💾 Сохранить в Excel
        </button>
      </div>
    </div>

    {/* Таблица */}      
    <div 
      className="ag-theme-quartz" 
      style={{ 
        height: '100vh',
        width: '100%',
        overflow: 'auto',
        marginBottom: '15px'
      }}
    >
      <AgGridReact
        localeText={RU_LOCALE_TEXT}
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        rowHeight={25}
        onCellValueChanged={onCellValueChanged}
        domLayout="normal"
        suppressHorizontalScroll={false}
        enableCellTextSelection={true}
        ensureDomOrder={true}
        defaultColDef={{
          resizable: true,
          editable: true,
          singleClickEdit: true,
          cellStyle: (params: any) => {
            const baseStyle = { border: '1px solid #ddd' };
            if (params.data?.at_work === 'ДЦ') {
              return {
                ...baseStyle,
                color: 'red'
              };
            }
            return baseStyle;
          }
        }}
        stopEditingWhenCellsLoseFocus={true}
      />
    </div>
    
    {/* Условный рендеринг модального окна сотрудников */}
    {isEmployeesModalOpen && (
      <EmployeesModal
        factoryInn={selectedFactoryInn}   
        factoryName={selectedFactoryName} 
        onClose={() => setIsEmployeesModalOpen(false)}
      />
    )}

    {/* ▽ ДОБАВЛЯЕМ МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ ФАБРИКИ ▽ */}
    {isAddModalOpen && (
      <AddFactoryModal
        activityTypeNames={activityTypeNames}
        managerNames={managerNames}
        onClose={() => !isLoading && setIsAddModalOpen(false)}
        onSave={handleAddFactory}
        isLoading={isLoading}
      />
    )}

  </>
  );
}


export default FactoryTable;
export type { Factory };  // ← Явно экспортируем тип