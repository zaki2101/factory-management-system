// хук для управления состоянием (xтобы отслеживать, открыто ли модальное окно)
import React, { useState } from 'react'; 
import FactoryTable from './FactoryTable';

import AddFactoryModal from './AddFactoryModal'; // подключение компонента модального окна

import { Factory } from './FactoryTable';
import './App.css';

function App() {
  // Создание состояния для модального окна
  // isAddModalOpen хранит true/false (открыто/закрыто окно)
  //  setIsAddModalOpen меняет это значение
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  
  // onClick={() => setIsAddModalOpen(true)} меняет состояние на true → открывает модальное окно
  return (
    <div className="App">
      {/* Сообщение об ошибке */}
      {error && <div className="error-message">{error}</div>}

      <div className="header">
        <h2>Сегмент Фабрика</h2>
        <button 
          className="add-button"
          onClick={() => setIsAddModalOpen(true)}
          disabled={isLoading} 
        >
          {isLoading ? 'Загрузка...' : '+ Добавить предприятие'}
        </button>
      </div>

      <FactoryTable />
      
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
    </div>
  );
}

export default App;

