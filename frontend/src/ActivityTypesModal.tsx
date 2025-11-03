// Виды деятельности модальное окно

import React, { useState, useEffect, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';

import './App.css';
import { RU_LOCALE_TEXT } from './agGridRussian'; // Русская локализация для AG Grid

interface ActivityType {
  id: number;
  name: string;
  description: string | null;
}

interface ActivityTypesModalProps {
  onClose: () => void;
}

const ActivityTypesModal: React.FC<ActivityTypesModalProps> = ({ onClose }) => {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newActivity, setNewActivity] = useState({
    name: '',
    description: ''
  });

  // Загрузка видов деятельности
  const fetchActivityTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/activity-types/');
      if (!response.ok) throw new Error('Ошибка загрузки');
      const data = await response.json();
      setActivityTypes(data);
    } catch (err) {
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  // Добавление нового вида деятельности
  const handleAddActivityType = async () => {
    if (!newActivity.name.trim()) {
      alert('Введите название вида деятельности');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/activity-types/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newActivity.name,
          description: newActivity.description || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка при добавлении');
      }

      setNewActivity({ name: '', description: '' });
      await fetchActivityTypes();
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка при добавлении');
    }
  };

  // Обработчик изменения ячейки (автосохранение)
  // При изменении любой ячейки AG Grid автоматически вызывает эту функцию и отправляет обновленные данные на сервер
  const handleCellValueChanged = useCallback(async (params: any) => {
    try {
      const response = await fetch(`http://localhost:8000/activity-types/${params.data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: params.data.name,
          description: params.data.description
        })
      });

      if (!response.ok) {
        alert('Ошибка сохранения изменений');
        await fetchActivityTypes(); // Перезагружаем данные
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка при сохранении изменений');
      await fetchActivityTypes();
    }
  }, []);

  // Удаление вида деятельности
  const handleDeleteActivityType = async (id: number) => {
    if (!window.confirm('Удалить этот вид деятельности?')) return;

    try {
      const response = await fetch(`http://localhost:8000/activity-types/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchActivityTypes();
      } else {
        alert('Ошибка при удалении');
      }
    } catch (err) {
      alert('Ошибка при удалении');
    }
  };

  useEffect(() => {
    fetchActivityTypes();
  }, []);

  // Колонки для AG Grid
  const columnDefs: ColDef[] = [
    { 
      field: 'name', 
      headerName: 'Название', 
      width: 350, 
      sortable: true, 
      filter: true,
      editable: true 
    },
    { 
      field: 'description', 
      headerName: 'Описание', 
      width: 360, 
      sortable: false, 
      filter: false,
      editable: true 
    },
    {
      field: 'actions',
      headerName: '❌',
      width: 60,
      cellRenderer: (params: any) => (
        <button 
          onClick={() => handleDeleteActivityType(params.data.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red' }}
          title="Удалить"
        >
          ✖️
        </button>
      ),
      sortable: false,
      filter: false,
      editable: false
    }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>Справочник Виды деятельности</h3>
          <button onClick={onClose} >×</button>
        </div>
        
        <div className="modal-body">
          {/* Панель добавления */}
          <div style={{ 
            padding: '10px', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                placeholder="Название вида деятельности"
                value={newActivity.name}
                onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
                style={{ padding: '8px', flex: 1 }}
              />
              <input
                placeholder="Описание (необязательно)"
                value={newActivity.description}
                onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                style={{ padding: '8px', flex: 1 }}
              />
              <button 
                onClick={handleAddActivityType}
                style={{ 
                  padding: '8px 15px', 
                  background: '#2196F3', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px' 
                }}
              >
                Добавить
              </button>
            </div>
          </div>

          {loading && <div>Загрузка...</div>}
          {error && <div className="error">{error}</div>}
          
          {!loading && !error && (
            <div className="ag-theme-quartz" style={{ flex: 1 }}>
              <AgGridReact
                localeText={RU_LOCALE_TEXT} // Русская локализация для AG Grid
                rowData={activityTypes}
                columnDefs={columnDefs}
                rowHeight={40}
                /* При изменении любой ячейки AG Grid автоматически вызывает 
                функцию handleCellValueChanged и отправляет обновленные данные на сервер */
                onCellValueChanged={handleCellValueChanged}
                defaultColDef={{
                  resizable: true,
                  sortable: true,
                  filter: true,
                  editable: true
                }}
                enableCellTextSelection={true}
                stopEditingWhenCellsLoseFocus={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityTypesModal;