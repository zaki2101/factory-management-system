// Модальное окно для вывода сотрудников предприятия из таблицы Фабрики
// Вывод только для конкретного предприятия

import React, { useState, useEffect, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';

import './App.css';
import { RU_LOCALE_TEXT } from './agGridRussian'; // Русская локализация для AG Grid

interface EmployeesModalProps {
  factoryInn: string; // передаем ИНН из таблицы Фабрики
  factoryName: string; // передаем название из таблицы Фабрики
  onClose: () => void;
}

interface Employee {
  id: number;
  inn: string;
  name_factory: string;
  employee: string;
  position: string | null;
  phone: string | null;
  email: string | null;
  comment1: string | null;
  comment2: string | null;
  comment3: string | null;
  lead: string;
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
  const fetchEmployees = useCallback(async () => {
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
  }, [factoryInn]);

  useEffect(() => {
    if (factoryInn) fetchEmployees();
  }, [factoryInn, fetchEmployees]);


  // // Обработчик клика для переключения лида - 
  // ВНИМАНИЕ дублирование кода, эта функция используется в ContactsModal
  const handleLeadToggle = async (employeeId: number, currentLead: string) => {
    try {
      const newLeadValue = currentLead === "+" ? "-" : "+";
      const employee = employees.find(e => e.id === employeeId);
      if (!employee) return;
    
      const response = await fetch(`http://localhost:8000/employees/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...employee,
          lead: newLeadValue
        })
      });

      if (response.ok) {
        // ОБНОВЛЯЕМ ЛОКАЛЬНЫЕ ДАННЫЕ вместо полной перезагрузки
        setEmployees(prevEmployees => 
          prevEmployees.map(employee => 
            employee.id === employeeId 
              ? { ...employee, lead: newLeadValue } // меняем только поле lead
              : employee
          )
         );
      }

    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при обновлении статуса лида');
    }

  };


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
          inn: factoryInn, // ← Берем из пропсов! (EmployeesModal.tsx)
          name_factory: factoryName  // ← Берем из пропсов! (EmployeesModal.tsx)
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
        field: 'lead',
        headerName: 'ЛИД', 
        width: 80,
        cellRenderer: (params: any) => {
          return params.value === "+" ? "✅" : "□";
        },
        cellStyle: { 
          'cursor': 'pointer',
          'text-align': 'center'
        },
        onCellClicked: (params: any) => {
          handleLeadToggle(params.data.id, params.data.lead);
        },
        editable: false,
        sortable: true,
        filter: true
      },

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
        sortable: false, 
        filter: false,
        editable: true 
      },
      { 
        field: 'email', 
        headerName: 'Email', 
        width: 200, 
        sortable: false, 
        filter: false,
        editable: true 
      },

      { 
        field: 'comment1', 
        headerName: 'Комментарий', 
        width: 250, 
        sortable: true, 
        filter: true,
        editable: true,
        cellStyle: { 
          'white-space': 'normal',  // ← Разрешает перенос строк
          'line-height': '1.4',      // ← Увеличивает межстрочный интервал
          'text-align': 'left',  // ← Выравнивание по левому краю
        },
        autoHeight: true,           // ← Автоматическая высота строки (для многострочного текста)
        cellEditor: 'agLargeTextCellEditor',
        cellEditorPopup: true, 
        /* cellEditorPopup: true - параметр AG Grid, который заставляет редактор ячейки
         открываться во всплывающем окне поверх таблицы */
        cellEditorParams: { 
          maxLength: 500,        // максимальное количество символов
          rows: 10,                 // количество строк
        }

      },
      { 
        field: 'comment2', 
        headerName: 'Комментарий', 
        width: 250, 
        sortable: true, 
        filter: true,
        editable: true,
        cellStyle: { 
          'white-space': 'normal',  // ← Разрешает перенос строк
          'line-height': '1.4',      // ← Увеличивает межстрочный интервал
          'text-align': 'left',  // ← Выравнивание по левому краю
        },
        autoHeight: true,
        cellEditor: 'agLargeTextCellEditor',
        cellEditorPopup: true, 
        cellEditorParams: { 
          maxLength: 500,        
          rows: 10,                 
        }
      },
      { 
        field: 'comment3', 
        headerName: 'Комментарий', 
        width: 250, 
        sortable: true, 
        filter: true,
        editable: true,
        cellStyle: { 
          'white-space': 'normal',  // ← Разрешает перенос строк
          'line-height': '1.4',
          'text-align': 'left',  // ← Выравнивание по левому краю
        },
        autoHeight: true,
        cellEditor: 'agLargeTextCellEditor',
        cellEditorPopup: true, 
        cellEditorParams: { 
          maxLength: 500,        
          rows: 10,                
        }        
      },

      {
        field: 'actions',
        headerName: 'Действия',
        width: 120,
        cellRenderer: (params: any) => (
          <button 
            onClick={() => handleDeleteEmployee(params.data.id)}
            className="delete-btn"
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
        lead: "-",
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
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Добавить сотрудника в {factoryName}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span>Лид:</span>
              <div 
                onClick={() => setFormData({
                  ...formData, 
                  lead: formData.lead === "+" ? "-" : "+"
                })}
                className="lead-toggle"
              >
                {formData.lead === "+" ? "✅" : "□"}
              </div>
            </div>


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
            <button onClick={handleSave} 
              className="save-button"
            >
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
    <div className="modal-overlay">
      <div className="modal-content" style={{ 
        width: '95vw', 
        height: '95vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="modal-header">
          <h3>Сотрудники: {factoryName}</h3>
          <div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="save-button"
            >
              + Добавить сотрудника
            </button>
            <button onClick={onClose} className="cross-button">
              ×
            </button>
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
                localeText={RU_LOCALE_TEXT} // Русская локализация для AG Grid
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
