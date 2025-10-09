// Для отображения таблицы Контакты (по конопке Контакты)

import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';

import './App.css';

// Интерфейс для данных сотрудника (контакта)
interface Contact {
  id: number;
  inn: string;
  name_factory: string;    // Название фабрики
  employee: string;        // ФИО сотрудника
  position: string | null; // Должность
  phone: string | null;    // Телефон
  email: string | null;    // Email
  comment1: string | null; // Комментарий 1
  comment2: string | null; // Комментарий 2
  comment3: string | null; // Комментарий 3
}

// Пропсы компонента
interface ContactsModalProps {
  onClose: () => void;
}

const ContactsModal: React.FC<ContactsModalProps> = ({ onClose }) => {
  // Состояние для хранения списка контактов
  const [contacts, setContacts] = useState<Contact[]>([]);
  // Состояние загрузки данных
  const [loading, setLoading] = useState(true);
  // Состояние для ошибок
  const [error, setError] = useState<string | null>(null);

  // Функция загрузки всех сотрудников (контактов)
  const fetchContacts = async () => {
    try {
      setLoading(true);
      // Запрашиваем всех сотрудников с бэкенда
      const response = await fetch('http://localhost:8000/all-employees/');
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки данных контактов');
      }
      
      const data = await response.json();
      setContacts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик изменений
  // При изменении ячейки отправляем PUT-запрос на обновление данных сотрудника
  const handleCellValueChanged = async (params: any) => {
    try {
      const response = await fetch(`http://localhost:8000/employees/${params.data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params.data)
      });

      if (!response.ok) {
        alert('Ошибка сохранения изменений');
        await fetchContacts(); // Перезагружаем данные
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка при сохранении изменений');
      await fetchContacts();
    }
  };

  // Функция удаления записи -  запрашивает подтверждение, отправляет DELETE-запрос и обновляет таблицу
  const handleDeleteContact = async (contactId: number) => {
  // Подтверждение удаления
    if (!window.confirm('Удалить этот контакт?')) return;

    try {
      const response = await fetch(`http://localhost:8000/employees/${contactId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Успешно удалено - обновляем список
        await fetchContacts();
      } else {
        alert('Ошибка при удалении контакта');
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Ошибка при удалении контакта');
    }
  };


  // Обработчик клика для переключения лида
  const handleLeadToggle = async (contactId: number, currentLead: string) => {
    try {
      // Определяем новое значение: если было "+" -> "-", если "-" -> "+"
      const newLeadValue = currentLead === "+" ? "-" : "+";
    
      // Получаем текущие данные контакта
      const contact = contacts.find(c => c.id === contactId);
      if (!contact) return;
    
      // Отправляем обновление на сервер
      const response = await fetch(`http://localhost:8000/employees/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contact,
          lead: newLeadValue  // ← Новое значение lead
        })
      });

      if (response.ok) {
        // Обновляем локальные данные
        await fetchContacts();
      } else {
        alert('Ошибка при обновлении статуса лида');
     }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при обновлении статуса лида');
    }
  };



  // Загружаем контакты при открытии модального окна
  useEffect(() => {
    fetchContacts();
  }, []);



  // Колонки таблицы AG Grid
  const columnDefs: ColDef[] = [
    // кнопка удаление
    {
      field: 'actions',
      headerName: '❌',       // Иконка крестика в заголовке
      width: 60,
      cellRenderer: (params: any) => (
        <button 
          onClick={() => handleDeleteContact(params.data.id)}
          className="delete-button"
          title="Удалить контакт"
        >
          ✖️
        </button>
      ),
      sortable: false,        
      filter: false,          
      editable: false        
    },

    { 
      field: 'inn', 
      headerName: 'ИНН', 
      width: 150, 
      sortable: true, 
      filter: true,
      editable: false  // Не редактируемое
    },
    { 
      field: 'name_factory', 
      headerName: 'Наименование', 
      width: 200, 
      sortable: true, 
      filter: true,
      editable: false  // Не редактируемое
    },

    {
      field: 'lead',
      headerName: 'ЛИД', 
      width: 80,
      cellRenderer: (params: any) => {
        // Если lead = "+" - показываем галочку, иначе пусто
        return params.value === "+" ? "✅" : "□";
      },
      // Делаем ячейку кликабельной
      cellStyle: { 
        'cursor': 'pointer', //меняет курсор на "руку" при наведении
        'text-align': 'center' // центрирует галочку в ячейке
      },
      // обрабатывает клик по ячейке и вызывает функцию переключения
      onCellClicked: (params: any) => {
        handleLeadToggle(params.data.id, params.data.lead);
      },
      editable: false,  
      sortable: true,
      filter: true
    },
    { 
      field: 'employee', 
      headerName: 'ФИО сотрудника', 
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
    }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content-big">
        {/* Заголовок модального окна */}
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>Контакты сотрудников</h3>
          <button onClick={onClose}>×</button>
        </div>
        
        {/* Тело модального окна */}
        <div className="modal-body" style={{ 
          height: 'calc(100% - 60px)',
          padding: '15px'
        }}>
          {/* Сообщение о загрузке */}
          {loading && <div>Загрузка контактов...</div>}
          
          {/* Сообщение об ошибке */}
          {error && <div className="error">{error}</div>}
          
          {/* Таблица контактов */}
          {!loading && !error && (
            <div className="ag-theme-quartz" style={{ height: '100%', width: '100%' }}>
              <AgGridReact
                rowData={contacts}
                columnDefs={columnDefs}
                rowHeight={40}
                onCellValueChanged={handleCellValueChanged}  // Обработчик ячеек для редактировани
                stopEditingWhenCellsLoseFocus={true}         // Автоматическое изменение при переходе на др.ячейку (потеря фокуса)
                defaultColDef={{
                  resizable: true,
                  sortable: true,
                  filter: true,
                  editable: false,  
                  cellStyle: { 
                    'border-bottom': '1px solid #ddd'  // ← Граница снизу  
                  }
                }}
                enableCellTextSelection={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactsModal;