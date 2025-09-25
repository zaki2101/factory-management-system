// Модальное окно для вывода сотрудников предприятия

import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
//import 'ag-grid-community/styles/ag-grid.css';
//import 'ag-grid-community/styles/ag-theme-quartz.css';

interface EmployeesModalProps {
  factoryInn: string;
  factoryName: string;
  onClose: () => void;
}

interface Employee {
  id: number;
  inn: string;
  employee: string;
  position: string | null;
  phone: string | null;
  email: string | null;
  comment1: string | null;
  comment2: string | null;
  comment3: string | null;
}

interface NewEmployee {
  employee: string;
  position: string;
  phone: string;
  email: string;
  comment1: string;
  comment2: string;
  comment3: string;
}

const EmployeesModal: React.FC<EmployeesModalProps> = ({ factoryInn, factoryName, onClose }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Загрузка сотрудников
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/factories/${factoryInn}/employees`);
      
      if (!response.ok) throw new Error('Ошибка загрузки данных');
      
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (factoryInn) fetchEmployees();
  }, [factoryInn]);

  // Добавление нового сотрудника
  const handleAddEmployee = async (employeeData: NewEmployee) => {
    if (!employeeData.employee.trim()) {
      alert('Введите ФИО сотрудника');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/employees/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...employeeData,
          inn: factoryInn
        })
      });

      if (!response.ok) throw new Error('Ошибка при добавлении');

      // Обновляем список и закрываем модальное окно
      await fetchEmployees();
      setIsAddModalOpen(false);
      
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при добавлении сотрудника');
    }
  };

  // Функция сохранения изменений при редактировании ячейки
  const handleCellValueChanged = async (params: any) => {
    try {
      const response = await fetch(`http://localhost:8000/employees/${params.data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params.data)
      });

      if (!response.ok) {
        alert('Ошибка сохранения изменений');
        await fetchEmployees(); // Перезагружаем данные в случае ошибки
        return;
      }

      console.log('Изменения сохранены:', params.data);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка при сохранении изменений');
      await fetchEmployees(); // Перезагружаем данные в случае ошибки
    }
  };    

  // Колонки таблицы сотрудников
  const columnDefs: ColDef[] = [
    { 
      field: 'employee', 
      headerName: 'ФИО', 
      width: 200, 
      sortable: true, 
      filter: true,
      editable: true 
    },
    { 
      field: 'position', 
      headerName: 'Должность', 
      width: 150, 
      sortable: true, 
      filter: true,
      editable: true 
    },
    { 
      field: 'phone', 
      headerName: 'Телефон', 
      width: 150, 
      sortable: true, 
      filter: true,
      editable: true 
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      width: 200, 
      sortable: true, 
      filter: true,
      editable: true 
    },
    { 
      field: 'comment1', 
      headerName: 'Комментарий 1', 
      width: 150, 
      sortable: true, 
      filter: true,
      editable: true 
    },
    { 
      field: 'comment2', 
      headerName: 'Комментарий 2', 
      width: 150, 
      sortable: true, 
      filter: true,
      editable: true 
    },
    { 
      field: 'comment3', 
      headerName: 'Комментарий 3', 
      width: 150, 
      sortable: true, 
      filter: true,
      editable: true 
    },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 120,
      cellRenderer: (params: any) => (
        <button 
          onClick={() => handleDeleteEmployee(params.data.id)}
          className="delete-btn"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          🗑️ Удалить
        </button>
      ),
      sortable: false,
      filter: false,
      editable: false
    }
  ];

  const handleDeleteEmployee = async (employeeId: number) => {
    if (!window.confirm('Удалить сотрудника?')) return;
    
    try {
      const response = await fetch(`http://localhost:8000/employees/${employeeId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchEmployees();
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  // Компонент модального окна добавления сотрудника
  const AddEmployeeModal: React.FC<{ onClose: () => void; onSave: (employee: NewEmployee) => void }> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
      employee: '',
      position: '',
      phone: '',
      email: '',
      comment1: '',
      comment2: '',
      comment3: ''
    });

    const handleSave = () => {
      if (!formData.employee.trim()) {
        alert('Введите ФИО сотрудника');
        return;
      }
      onSave(formData);
    };

    return (
      <div className="modal-overlay" style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: 'rgba(0,0,0,0.5)', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        zIndex: 1000 
      }}>
        <div className="modal-content" style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          width: '500px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <h3>Добавить сотрудника</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
            <input
              placeholder="ФИО *"
              value={formData.employee}
              onChange={(e) => setFormData({...formData, employee: e.target.value})}
              style={{ padding: '8px' }}
            />
            <input
              placeholder="Должность"
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
              style={{ padding: '8px' }}
            />
            <input
              placeholder="Телефон"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              style={{ padding: '8px' }}
            />
            <input
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{ padding: '8px' }}
            />
            <input
              placeholder="Комментарий 1"
              value={formData.comment1}
              onChange={(e) => setFormData({...formData, comment1: e.target.value})}
              style={{ padding: '8px' }}
            />
            <input
              placeholder="Комментарий 2"
              value={formData.comment2}
              onChange={(e) => setFormData({...formData, comment2: e.target.value})}
              style={{ padding: '8px' }}
            />
            <input
              placeholder="Комментарий 3"
              value={formData.comment3}
              onChange={(e) => setFormData({...formData, comment3: e.target.value})}
              style={{ padding: '8px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleSave} style={{ 
              padding: '8px 15px', 
              background: '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px' 
            }}>
              Сохранить
            </button>
            <button onClick={onClose} style={{ 
              padding: '8px 15px', 
              background: '#ccc', 
              border: 'none', 
              borderRadius: '4px' 
            }}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999
    }}>
      <div className="modal-content" style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        width: '95vw', 
        height: '95vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="modal-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '15px' 
        }}>
          <h3>Сотрудники: {factoryName}</h3>
          <div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              style={{ 
                padding: '8px 15px', 
                background: '#4CAF50', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                marginRight: '10px',
                cursor: 'pointer'
              }}
            >
              + Добавить сотрудника
            </button>
            <button onClick={onClose} style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer'
            }}>×</button>
          </div>
        </div>
        
        <div className="modal-body" style={{ 
          height: 'calc(100% - 80px)',
          flex: 1
        }}>
          {loading && <div>Загрузка...</div>}
          {error && <div className="error">Ошибка: {error}</div>}
          
          {!loading && !error && (
            <div className="ag-theme-quartz" style={{ height: '100%', width: '100%' }}>
              <AgGridReact
                rowData={employees}
                columnDefs={columnDefs}
                rowHeight={35}
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

        {/* Модальное окно добавления сотрудника */}
        {isAddModalOpen && (
          <AddEmployeeModal
            onClose={() => setIsAddModalOpen(false)}
            onSave={handleAddEmployee}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeesModal;
