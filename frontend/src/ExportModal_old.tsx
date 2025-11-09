// модальное окно для фильтров экспорта

import React, { useState } from 'react';
// useState - хранит значения фильтров (даты начала и конца)

import './App.css';

// пропсы: функции закрытия и экспорта, статус загрузки
interface ExportModalProps {
  onClose: () => void; // Функция закрытия окна
  onExport: (filters: { startDate: string; endDate: string }) => void; // Функция экспорта
  isLoading?: boolean; // Флаг загрузки (опциональный)
}


const ExportModal: React.FC<ExportModalProps> = ({ onClose, onExport, isLoading = false }) => {
  // Состояние для фильтров
  const [filters, setFilters] = useState({
    startDate: '', // Начальная дата периода
    endDate: ''    // Конечная дата периода
  });

  // Обработчик изменения дат, обновляет фильтры при изменении полей ввода
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setFilters(prev => ({
      ...prev,  // Копируем предыдущие значения
      [field]: value  // Обновляем только одно поле
    }));
  };

  // Обработчик отправки формы (валидация и вызов функции экспорта)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();  // Отменяем стандартное поведение формы
    
    // Базовая валидация (Проверяем что дата "с" не больше даты "по")
    if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
      alert('Дата "с" не может быть больше даты "по"');
      return;
    }
    
    onExport(filters);  // Вызываем функцию из родителя
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '400px' }}>
        <h3>Экспорт в Excel</h3>
        <p>Выберите период для экспорта данных:</p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Дата с:
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Дата по:
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={onClose}
              disabled={isLoading}
              style={{ padding: '8px 15px', background: '#ccc', border: 'none', borderRadius: '4px' }}
            >
              Отмена
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              style={{ padding: '8px 15px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              {isLoading ? 'Экспорт...' : 'Экспортировать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportModal;