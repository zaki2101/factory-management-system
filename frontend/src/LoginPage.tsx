// Страница авторизации

import React, { useState } from 'react';


interface LoginPageProps {
  onLogin: (userData: any) => void;  // Функция, которая вызовется после успешного логина
}

// интерфейс для ответа сервера
interface LoginResponse {
  token: string;
  user_data: {
    login: string;
    manager_name: string;
    role: string;
  };
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);


  /** handleSubmit
  * Обработчик отправки формы логина
  * 
  * Процесс:
  * 1. Отправляет логин и пароль на сервер /auth/login
  * 2. При успехе получает JWT токен и данные пользователя
  * 3. Сохраняет токен в localStorage для последующих запросов
  * 4. Сохраняет данные пользователя для отображения в интерфейсе
  * 5. Вызывает колбэк onLogin для перехода к основному приложению
  * 
  * Обрабатывает ошибки:
  * - Неверный логин/пароль (401)
  * - Проблемы с сетью
  * - Серверные ошибки
  */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Отправляем запрос на бэкенд
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: login,
          password: password,
        }),
      });

      // 2. Проверяем успешность запроса
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.detail}`);
        return;
      }

      // 3. Получаем токен и данные пользователя
      const data: LoginResponse = await response.json();
    
      // 4. Сохраняем в localStorage
      //localStorage.setItem('token', data.token);
      //localStorage.setItem('userData', JSON.stringify(data.user_data));
    
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('userData', JSON.stringify(data.user_data));


      // 5. Вызываем колбэк успешного логина
      onLogin(data.user_data);
    
    } catch (error) {
      console.error('Ошибка сети:', error);
      alert('Ошибка сети при входе');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <input 
          type="text"
          placeholder="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
        />
        <input
          type="password" 
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;