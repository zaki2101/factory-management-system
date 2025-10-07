// хук для управления состоянием (xтобы отслеживать, открыто ли модальное окно)
import React, { useState, useEffect } from 'react'; 
import FactoryTable from './FactoryTable';

import AddFactoryModal from './AddFactoryModal'; // подключение компонента модального окна
import ExportModal from './ExportModal'; // подключение модального окна для сохранения предприятий в файл

import ActivityTypesModal from './ActivityTypesModal'; // подключение модального окна видов деятельности
import ManagersModal from './ManagersModal'; // подключение модального окна менеджеров

import { Factory } from './FactoryTable';
import './App.css';

function App() {
  // Создание состояния для модального окна
  // isAddModalOpen хранит true/false (открыто/закрыто окно)
  //  setIsAddModalOpen меняет это значение
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Состояние для модального окна экспорта файла предприятий
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  // Состояние модального окна видов деятельности
  const [isActivityTypesModalOpen, setIsActivityTypesModalOpen] = useState(false); 
  
  // Состояние модального окна справочника Менеджеров
  const [isManagersModalOpen, setIsManagersModalOpen] = useState(false); 

  /* **********************************
  Виды деятельности выгружаются при старте, простая реализация, т.к
  справочник редко корректируется, сохраняем только названия
  */
  const [activityTypeNames, setActivityTypeNames] = useState<string[]>([]);


  const fetchActivityTypes = async () => {
    try {
      const response = await fetch('http://localhost:8000/activity-types/');
      if (response.ok) {
        const data = await response.json();
        // ↓↓↓ Извлекаем ТОЛЬКО названия ↓↓↓
        const names = data.map((activity: any) => activity.name);
        setActivityTypeNames(names);
      }
    } catch (error) {
      console.error('Ошибка загрузки видов деятельности:', error);
    }
  };

  // Загружаем один раз при запуске
  useEffect(() => {
    fetchActivityTypes();
  }, []);


/* **********************************
  Менеджеры выгружаются при старте, простая реализация, т.к
  справочник редко корректируется, сохраняем только названия
  */
  const [managerNames, setManagerNames] = useState<string[]>([]);

  const fetchManagers = async () => {
    try {
      const response = await fetch('http://localhost:8000/managers/');
      if (response.ok) {
        const data = await response.json();
        // ↓↓↓ Извлекаем ТОЛЬКО ФИО ↓↓↓
        const manager_names = data.map((manager: any) => manager.manager_name);
        setManagerNames(manager_names);
      }
    } catch (error) {
      console.error('Ошибка загрузки менеджеров:', error);
    }
  };

  // Загружаем один раз при запуске
  useEffect(() => {
    fetchManagers();
  }, []);


  // Функция открытия модального окна справочника видов деятельности
  const handleOpenActivityTypesModal = () => {
    setIsActivityTypesModalOpen(true);
  };

  // Функция открытия модального окна справочника менеджеров
  const handleOpenManagersModal = () => {
    setIsManagersModalOpen(true);
  };


  // Функция открытия модального окна экспорта предприятий
  const handleOpenExportModal = () => {
    setIsExportModalOpen(true);
  };

  // Функция закрытия модального окна экспорта предприятий
  const handleCloseExportModal = () => {
    setIsExportModalOpen(false);
  };


  // Функция для экспорта в Excel предприятий (с фильтрами)
  const handleExportWithFilters = async (filters: { startDate: string; endDate: string }) => {
    try {
      // 1. Формируем URL с параметрами фильтрации
      const params = new URLSearchParams();
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
    
      const url = `http://localhost:8000/export/factories/excel?${params.toString()}`;
      console.log('Export URL:', url); // Для отладки

      // 2. Делаем запрос к НОВОМУ URL с параметрами
      const response = await fetch(url); // ← Используем url с параметрами!
    
      if (!response.ok) {
        throw new Error('Ошибка при экспорте');
      }

      // 3. Создаем blob из ответа и запускаем скачивание
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob); // ← Переименовал переменную!
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
    
      // 4. Извлекаем имя файла из заголовков ответа или генерируем
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'fabriki_export.xlsx';
    
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
    
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    
      // 5. Закрываем модальное окно после успешного экспорта
      setIsExportModalOpen(false);
    
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      alert('Ошибка при экспорте в Excel');
    }
  };



  // onClick={() => setIsAddModalOpen(true)} меняет состояние на true → открывает модальное окно
  return (
    <div className="App">
      {/* Сообщение об ошибке */}
      {error && <div className="error-message">{error}</div>}

      <div className="header">
        <h2>Сегмент Фабрика</h2>
        <button 
          className="factory-button"
          onClick={() => setIsAddModalOpen(true)}
          disabled={isLoading} 
        >
          {isLoading ? 'Загрузка...' : '+ Добавить предприятие'}
        </button>

        {/* кнопка экспорта файла - открывает модальное окно */}
        <button className="factory-button" onClick={handleOpenExportModal} >
           Сохранить в Excel
        </button>

        {/* кнопка справочника видов деятельности - открывает модальное окно */}
        <button 
          className="directory-button"
          onClick={handleOpenActivityTypesModal}
          title="Справочник Виды деятельности"
        >
          Виды деятельности
        </button>

        {/* кнопка справочника менеджеров - открывает модальное окно */}
        <button 
          className="directory-button"
          onClick={handleOpenManagersModal}
          title="Справочник Менеджеры"
        >
          Менеджеры
        </button>

      </div>
      
      {/* Таблица - растягивается на оставшееся пространство */}
      <div style={{ flex: 1, minHeight: 0 }}></div>
      <FactoryTable 
        activityTypeNames={activityTypeNames} 
        managerNames={managerNames}
      />
      {/* activityTypeNames - список видов деятельности
          managerNames - список менеджеров
      */}


      {/* Модальное окно добавления фабрики */}
      {isAddModalOpen && (
        /* Условный рендеринг модального окна
          Показываем модальное окно только если isAddModalOpen === true
          onClose — закрывает окно (меняет состояние на false)
          onSave — вызывается при сохранении (пока просто логируем и закрываем окно)
        Принцип работы:
          1. Клик по кнопке → isAddModalOpen становится true
          2. React перерисовывает компонент → появляется модальное окно
          3. Закрытие/сохранение → isAddModalOpen становится false
          4. React перерисовывает компонент → модальное окно исчезает
        */
        <AddFactoryModal
          activityTypeNames={activityTypeNames}  // ← Только названия
          managerNames={managerNames} 
          onClose={() => !isLoading && setIsAddModalOpen(false)} 
          onSave={async (newFactory: Omit<Factory, 'id'> ) => {
            try {
              // 1. Сначала проверяем ИНН
              const checkResponse = await fetch(`http://localhost:8000/factories/inn/${newFactory.inn}`);
              if (checkResponse.ok) {
                // 2. Если ИНН существует - показываем ошибку и остаемся в форме
                alert('Предприятие с таким ИНН уже существует!');
                return; // ← Не закрываем модальное окно
              }
              // 3. Если ИНН свободен - сохраняем
              const saveResponse = await fetch('http://localhost:8000/factories/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newFactory)
              })

              if (saveResponse.ok) {
                console.log('Предприятие добавлено:');
                window.location.reload(); 
              }
              
            } catch (error) {
              console.error('Ошибка:', error);
            }

            setIsAddModalOpen(false);
          }}
          isLoading={isLoading} 
        />
      )}
      {/*  модальное окно экспорта файла предприятий */}
      {isExportModalOpen && (
        <ExportModal
          onClose={handleCloseExportModal}
          onExport={handleExportWithFilters}
          isLoading={isLoading}
        />
      )}

      {/* модальное окно справочника видов деятельности */}
      {isActivityTypesModalOpen && (
        <ActivityTypesModal
          onClose={() => setIsActivityTypesModalOpen(false)}
        />
      )}

      {/* модальное окно справочника видов деятельности */}
      {isManagersModalOpen && (
        <ManagersModal
          onClose={() => setIsManagersModalOpen(false)}
        />
      )}

    </div>
  );
}

export default App;




