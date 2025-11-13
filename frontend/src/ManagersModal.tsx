// Модальное окно для справочника "Менеджеры"

import React, { useState, useEffect, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
 
import { RU_LOCALE_TEXT } from './agGridRussian'; // Русская локализация для AG Grid
import './App.css';

interface Manager {
  id: number;
  manager_name: string;
  manager_phone: string | null;
  manager_email: string | null;
  manager_comment: string | null;
  login: string | null;
  password: string | null;
  role: string;  // 'admin' | 'user'
}

interface ManagersModalProps {
  onClose: () => void;
}

const ManagersModal: React.FC<ManagersModalProps> = ({ onClose }) => {
  const [Managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newManager, setNewManager] = useState({
    manager_name: '',
    manager_phone: '',
    manager_email: '',
    manager_comment: '',
    login: '',
    password: '', 
    role: 'user'
  });

  // Загрузка списка менеджеров
  const fetchManagers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/managers/');
      if (!response.ok) throw new Error('Ошибка загрузки');
      const data = await response.json();
      setManagers(data);
    } catch (err) {
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  // Добавление нового менеджера
  const handleAddManager = async () => {
    if (!newManager.manager_name.trim()) {
      alert('Введите менеджера');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/managers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manager_name: newManager.manager_name,
          manager_phone: newManager.manager_phone || null,
          manager_email: newManager.manager_email || null,
          manager_comment: newManager.manager_comment || null,
          login: newManager.login || null,
          password: newManager.password || null,
          role: newManager.role || 'user'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка при добавлении');
      }

      setNewManager({ manager_name: '', manager_phone: '', manager_email: '', manager_comment: '',
        login: '', password: '', role: 'user'});
      await fetchManagers();
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка при добавлении');
    }
  };

  // Обработчик изменения ячейки (автосохранение)
  // При изменении любой ячейки AG Grid автоматически вызывает эту функцию и отправляет обновленные данные на сервер
  const handleCellValueChanged = useCallback(async (params: any) => {
    try {
      const response = await fetch(`http://localhost:8000/managers/${params.data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manager_name: params.data.manager_name,
          manager_phone: params.data.manager_phone,
          manager_email: params.data.manager_email,
          manager_comment: params.data.manager_comment,
          login: params.data.login,
          password: params.data.password, 
          role: params.data.role
        })
      });

      if (!response.ok) {
        alert('Ошибка сохранения изменений');
        await fetchManagers(); // Перезагружаем данные
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка при сохранении изменений');
      await fetchManagers();
    }
  }, []);

  // Удаление менеджера
  const handleDeleteManager = async (id: number) => {
    if (!window.confirm('Удалить менеджера?')) return;

    try {
      const response = await fetch(`http://localhost:8000/managers/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchManagers();
      } else {
        alert('Ошибка при удалении');
      }
    } catch (err) {
      alert('Ошибка при удалении');
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  // Колонки для AG Grid
  const columnDefs: ColDef[] = [
    { 
      field: 'manager_name', 
      headerName: 'ФИО', 
      width: 250, 
      sortable: true, 
      filter: true,
      editable: true 
    },
    { 
      field: 'login', 
      headerName: 'Логин', 
      width: 200, 
      editable: true,
      sortable: true,
      filter: true
    },
    { 
      field: 'password', 
      headerName: 'Пароль', 
      width: 200, 
      editable: true,
      sortable: false, 
      filter: false
    },
    { 
      field: 'role', 
      headerName: 'Роль', 
      width: 100,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['user', 'admin']  // ← варианты выбора
      },
      sortable: true,
      filter: true
    },
    { 
      field: 'manager_phone', 
      headerName: 'Телефон', 
      width: 200, 
      sortable: false, 
      filter: false,
      editable: true 
    },
    { 
      field: 'manager_email', 
      headerName: 'Email', 
      width: 200, 
      sortable: false, 
      filter: false,
      editable: true 
    },
    { 
      field: 'manager_comment', 
      headerName: 'Комментарий', 
      width: 200, 
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
          onClick={() => handleDeleteManager(params.data.id)}
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
    <div className="modal-overlay"> {/* фон модального окна */}
      <div className="modal-content-big"> {/* модальное окно */}
        <div className="modal-header"> {/* шапка */}
          <h3 style={{ margin: 0 }}>Справочник Менеджеры</h3>
          <button onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body"> {/* тело модального окна */}
         <div className="add-panel-in-modal"> {/* Панель добавления менеджера (сверху окна) */}
            <div className="input-in-modal"> {/* контейнер полей */}
              <input
                placeholder="Фамилия"
                value={newManager.manager_name}
                onChange={(e) => setNewManager({...newManager, manager_name: e.target.value})}
                style={{ padding: '8px', flex: 1 }}
              />
              <input
                placeholder="Логин"
                value={newManager.login}
                onChange={(e) => setNewManager({...newManager, login: e.target.value})}
                style={{ padding: '8px', flex: 1 }}
              />
              <input
                placeholder="Пароль"
                value={newManager.password}
                onChange={(e) => setNewManager({...newManager, password: e.target.value})}
                style={{ padding: '8px', flex: 1 }}
              />
              <select
                value={newManager.role}
                onChange={(e) => setNewManager({...newManager, role: e.target.value})}
                style={{ padding: '8px', flex: 1 }}
              >
                <option value="user">Пользователь</option>
                <option value="admin">Администратор</option>
              </select>
              <input
                placeholder="Телефон (необязательно)"
                value={newManager.manager_phone}
                onChange={(e) => setNewManager({...newManager, manager_phone: e.target.value})}
                style={{ padding: '8px', flex: 1 }}
              />
              <input
                placeholder="Email (необязательно)"
                value={newManager.manager_email}
                onChange={(e) => setNewManager({...newManager, manager_email: e.target.value})}
                style={{ padding: '8px', flex: 1 }}
              />
               <input
                placeholder="Комментарий (необязательно)"
                value={newManager.manager_comment}
                onChange={(e) => setNewManager({...newManager, manager_comment: e.target.value})}
                style={{ padding: '8px', flex: 1 }}
              />

              <button 
                onClick={handleAddManager}
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
                rowData={Managers}
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

export default ManagersModal;