// ФОРМА ДЛЯ ДОБАВЛЕНИЯ ЗАПИСИ
/*
[Пользователь вводит данные] → 
[Обновление formData] → 
[Кнопка "Сохранить"] → 
[Вызов onSave(formData)] → 
[Данные уходят в родительский компонент] →
[Закрытие модального окна]

Ключевые моменты:
useState - хранит данные формы
onChange - обновляет состояние при вводе
onSubmit - обрабатывает отправку формы
Omit<Factory, 'id'> - тип без поля id (так как id создается в базе)
Принцип работы: При вводе данных в поля форма автоматически обновляет состояние formData.
*/

// Импортируем необходимые модули React
import React, { useState } from 'react';

import './App.css';
//import { RU_LOCALE_TEXT } from './agGridRussian'; // Русская локализация для AG Grid

// Определяем интерфейс для пропсов компонента
interface AddFactoryModalProps {
  onClose: () => void;          // Функция закрытия модального окна
  onSave: (factory: any) => void;
  isLoading?: boolean; // ← Добавляем пропс загрузки
  activityTypeNames: string[]; // Список Виды деятельности
  managerNames: string[]; // Список Менеджеры
}

//const typeFactoryValues = ['ПРОЕКТИРОВАНИЕ', 'ХИМИЯ', 'ФАРМАЦЕВТИКА'];

// Создаем функциональный компонент
const AddFactoryModal: React.FC<AddFactoryModalProps> = ({ 
  onClose, onSave, isLoading = false, activityTypeNames, managerNames }) => {
  
  // Создаем состояние для хранения данных формы
  const [formData, setFormData] = useState({
    manager: '',               // Поле менеджера (пустая строка по умолчанию)
    city: '',                  // Поле города
    name: '',                  // Название предприятия
    inn: '',                   // ИНН
    address: '',               // Адрес
    n_empl: 0,                 // Количество сотрудников (число 0 по умолчанию)
    okved: '',                 // ОКВЭД
    type_factory: '',          // Тип производства
    emails: '',                // Email
    website: '',               // Сайт
    phones: '',                // Телефоны
    add_contacts: '',          // Дополнительные контакты
    comment1: '',              // Комментарий 1
    comment2: '',              // Комментарий 2  
    comment3: '',              // Комментарий 3
    comment4: ''               // Комментарий 4
  });

  // Обработчик отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();        // Предотвращаем стандартное поведение формы
    onSave(formData);          // Вызываем функцию сохранения с данными формы
  };

  return (
    
    <div className="modal-overlay">
      
      {/* Контейнер содержимого модального окна */}
      <div className="modal-content">
        
        {/* Заголовок модального окна */}
        <div className="modal-header">
          <h3>Добавить новое предприятие</h3>
          <button onClick={onClose} >×</button>
        </div>

        {/* Форма для ввода данных */}
        <form onSubmit={handleSubmit}>
          
          {/* Контейнер для  полей ввода */}
          {/* "form-vertical" - вертикально, "form-row" - горизонтально */}
          <div className="form-vertical">
            
            {/* ПОЛЯ ДЛЯ ВВОДА */}

            {/* required - не может быть пустым */}  
            
            <select
              value={formData.manager}
              onChange={(e) => setFormData({...formData, manager: e.target.value})}
              required
            >
              <option value="">Выберите менеджера *</option>
              {managerNames.map(name => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>


            <select
              value={formData.type_factory}
              onChange={(e) => setFormData({...formData, type_factory: e.target.value})}
              required
            >
              <option value="">Выберите вид деятельности *</option>
              {activityTypeNames.map(name => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <input
              placeholder="Город "
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
            />
            <input
              placeholder="Наименование *"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <input
              placeholder="ИНН *"
              value={formData.inn}
              onChange={(e) => setFormData({...formData, inn: e.target.value})}
              required
            />
            <input
              placeholder="Адрес "
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
            <input
              placeholder="Кол-во сотрудников"
              type="number"
              value={formData.n_empl === 0 ? "" : formData.n_empl} 
              onChange={(e) => setFormData({...formData, 
                n_empl: e.target.value === "" ? 0 : Number(e.target.value) 
              })}
            />
            <input
              placeholder="ОКВЭД "
              value={formData.okved}
              onChange={(e) => setFormData({...formData, okved: e.target.value})}
            />
            <input
              placeholder="Электронные почты "
              value={formData.emails}
              onChange={(e) => setFormData({...formData, emails: e.target.value})}
            />
            <input
              placeholder="Сайт компании "
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
            />
            <input
              placeholder="Телефоны "
              value={formData.phones}
              onChange={(e) => setFormData({...formData, phones: e.target.value})}
            />
            <input
              placeholder="Доп. контакты "
              value={formData.add_contacts}
              onChange={(e) => setFormData({...formData, add_contacts: e.target.value})}
            />
            <input
              placeholder="Комментарий "
              value={formData.comment1}
              onChange={(e) => setFormData({...formData, comment1: e.target.value})}
            />
            <input
              placeholder="Комментарий "
              value={formData.comment2}
              onChange={(e) => setFormData({...formData, comment2: e.target.value})}
            />
            <input
              placeholder="Комментарий "
              value={formData.comment3}
              onChange={(e) => setFormData({...formData, comment3: e.target.value})}
            />

          </div>
          {/* Кнопка сохранения */}
          <button 
            type="submit"
            disabled={isLoading} 
          >
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </button>

          {/* Кнопка  */}
          <button 
            type="button" 
            onClick={onClose}
            disabled={isLoading} 
          >
            Отмена
          </button>
        </form>
      </div>
    </div>
  );
};

// Экспортируем компонент для использования в других файлах
export default AddFactoryModal;

