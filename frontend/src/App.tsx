// хук для управления состоянием (xтобы отслеживать, открыто ли модальное окно)
import React, { useState, useEffect } from 'react'; 
import FactoryTable from './FactoryTable';

import AddFactoryModal from './AddFactoryModal'; // подключение компонента модального окна
//import ExportModal from './ExportModal'; // подключение модального окна для сохранения предприятий в файл

import ActivityTypesModal from './ActivityTypesModal'; // подключение модального окна видов деятельности
import ManagersModal from './ManagersModal'; // подключение модального окна менеджеров

import { Factory } from './FactoryTable';
import ContactsModal from './ContactsModal'; // подключение модального окна по конпке Контакты
import './App.css';

/*<FactoryTable 
  activityTypeNames={activityTypeNames} 
  managerNames={managerNames}
  onOpenAddModal={() => setIsAddModalOpen(true)}
  onOpenActivityTypesModal={handleOpenActivityTypesModal}
  onOpenManagersModal={handleOpenManagersModal}
  onOpenContactsModal={handleOpenContactsModal}
/>
*/


function App() {
  // Создание состояния для модального окна
  // isAddModalOpen хранит true/false (открыто/закрыто окно)
  //  setIsAddModalOpen меняет это значение
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  // Состояние модального окна видов деятельности
  const [isActivityTypesModalOpen, setIsActivityTypesModalOpen] = useState(false); 
  
  // Состояние модального окна справочника Менеджеров
  const [isManagersModalOpen, setIsManagersModalOpen] = useState(false); 

  // Создаем состояние для модального окна таблицы Контакты
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);

  /* **********************************
  Виды деятельности выгружаются при старте, простая реализация, т.к
  справочник редко корректируется, сохраняем только названия
  */
  const [activityTypeNames, setActivityTypeNames] = useState<string[]>([]);

/* **********************************
  Менеджеры выгружаются при старте, простая реализация, т.к
  справочник редко корректируется, сохраняем только названия
  */
  const [managerNames, setManagerNames] = useState<string[]>([]);

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

  /*
  // Загружаем один раз при запуске
  useEffect(() => {
    fetchActivityTypes();
  }, []);

*/


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
    fetchActivityTypes();
    fetchManagers();
  }, []);


  // Функция открытия модального окна справочника видов деятельности
  const handleOpenActivityTypesModal = () => { setIsActivityTypesModalOpen(true); };

  // Функция открытия модального окна справочника менеджеров
  const handleOpenManagersModal = () => { setIsManagersModalOpen(true); };

  // Функция открытия модального окна Контакты
  const handleOpenContactsModal = () => { setIsContactsModalOpen(true); };


  // onClick={() => setIsAddModalOpen(true)} меняет состояние на true → открывает модальное окно
  return (
    <div className="App">
      {/* Сообщение об ошибке */}
      {error && <div className="error-message">{error}</div>}

      <FactoryTable 
        activityTypeNames={activityTypeNames} 
        managerNames={managerNames}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenActivityTypesModal={handleOpenActivityTypesModal}
        onOpenManagersModal={handleOpenManagersModal}
        onOpenContactsModal={handleOpenContactsModal}
      />
      {/* activityTypeNames - список видов деятельности
          managerNames - список менеджеров. */}  

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
      
      {/* модальное окно справочника видов деятельности */}
      {isActivityTypesModalOpen && (
        <ActivityTypesModal
          onClose={() => setIsActivityTypesModalOpen(false)}
        />
      )}

      {/* модальное окно справочника менеджеров */}
      {isManagersModalOpen && (
        <ManagersModal
          onClose={() => setIsManagersModalOpen(false)}
        />
      )}

      {/* рендеринг модального окна Контакты */}
      {isContactsModalOpen && (
        <ContactsModal onClose={() => setIsContactsModalOpen(false)} />
      )}
    </div>
  );
}

export default App;




//onExport={handleExportWithFilters}