// хук для управления состоянием (xтобы отслеживать, открыто ли модальное окно)
import React, { useState, useEffect } from 'react'; 
import FactoryTable from './FactoryTable';

import AddFactoryModal from './AddFactoryModal'; // подключение компонента модального окна
//import ExportModal from './ExportModal'; // подключение модального окна для сохранения предприятий в файл

import ActivityTypesModal from './ActivityTypesModal'; // подключение модального окна видов деятельности
import ManagersModal from './ManagersModal'; // подключение модального окна менеджеров

import { Factory } from './FactoryTable';
import ContactsModal from './ContactsModal'; // подключение модального окна по конпке Контакты
import LoginPage from './LoginPage';

import './App.css';



function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null); // пока не используется

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
    // Проверка авторизации
    const token = localStorage.getItem('token');
    const savedUserData = localStorage.getItem('userData');
  
    if (token && savedUserData) {
      checkAuth(token);
    }

    fetchActivityTypes();
    fetchManagers();
  }, []);


  /** checkAuth
    * Проверка валидности JWT токена при загрузке приложения
    * 
    * 1. Отправляет токен на /auth/me для проверки
    * 2. Если токен валидный - устанавливает пользователя и переводит в авторизованное состояние
    * 3. Если токен невалидный (истек или подделан) - очищает localStorage
     * 
    * Зачем нужна:
    * - Предотвращает доступ с просроченным токеном
    * - Обеспечивает безопасность при перезагрузке страницы
    * - Автоматический выход при истечении сессии
    */
  const checkAuth = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    
      if (response.ok) {
        const userData = await response.json();
        setUserData(userData);
        setIsAuthenticated(true);
      } else {
        // Токен невалидный - очищаем хранилище
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
    }
  };


  // Функция открытия модального окна справочника видов деятельности
  const handleOpenActivityTypesModal = () => { setIsActivityTypesModalOpen(true); };

  // Функция открытия модального окна справочника менеджеров
  const handleOpenManagersModal = () => { setIsManagersModalOpen(true); };

  // Функция открытия модального окна Контакты
  const handleOpenContactsModal = () => { setIsContactsModalOpen(true); };


  // onClick={() => setIsAddModalOpen(true)} меняет состояние на true → открывает модальное окно
  return (
  <div className="App">
    {isAuthenticated ? (
      <>
        {/* Сообщение об ошибке */}
        {error && <div className="error-message">{error}</div>}

        <FactoryTable 
          activityTypeNames={activityTypeNames} 
          managerNames={managerNames}
          onOpenActivityTypesModal={handleOpenActivityTypesModal}
          onOpenManagersModal={handleOpenManagersModal}
          onOpenContactsModal={handleOpenContactsModal}
        />

        
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
      </>
    ) : (
      // Страница логина
      <LoginPage onLogin={(userData) => {
        setUserData(userData);
        setIsAuthenticated(true);
      }} />
    )}
  </div>
);
}

export default App;




//onExport={handleExportWithFilters}