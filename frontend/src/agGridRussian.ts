/**
 * Русская локализация для AG Grid
 * 
 * Содержит переводы всех стандартных текстов интерфейса AG Grid:
 * - Фильтры и их операторы
 * - Кнопки действий  
 * - Меню сортировки и колонок
 * - Пагинация
 * - Системные сообщения
 * 
 * Использование:
 * import { RU_LOCALE_TEXT } from './agGridRussian';
 * 
 * <AgGridReact
 *   localeText={RU_LOCALE_TEXT}
 *   // ...
 * />
 */

const RU_LOCALE_TEXT = {
  // ===== ФИЛЬТРЫ =====
  filterOoo: 'Фильтр...',
  
  // Операторы фильтрации
  equals: 'Равно',
  notEqual: 'Не равно', 
  lessThan: 'Меньше чем',
  greaterThan: 'Больше чем',
  lessThanOrEqual: 'Меньше или равно',
  greaterThanOrEqual: 'Больше или равно',
  inRange: 'В диапазоне',
  inRangeStart: 'От',
  inRangeEnd: 'До',
  
  // Текстовые фильтры
  contains: 'Содержит',
  notContains: 'Не содержит',
  startsWith: 'Начинается с',
  endsWith: 'Заканчивается на',
  blank: 'Пусто',
  notBlank: 'Не пусто',
  
  // ===== КНОПКИ ФИЛЬТРОВ =====
  applyFilter: 'Применить',
  resetFilter: 'Сбросить', 
  clearFilter: 'Очистить',
  cancelFilter: 'Отмена',
  
  // ===== ЛОГИЧЕСКИЕ ОПЕРАТОРЫ ФИЛЬТРОВ =====
  andCondition: 'И',
  orCondition: 'ИЛИ',
  
  // ===== УСЛОВИЯ ФИЛЬТРОВ =====
  conditionAnd: 'И',
  conditionOr: 'ИЛИ',

  // ===== СОРТИРОВКА =====
  sortAscending: 'Сортировка по возрастанию',
  sortDescending: 'Сортировка по убыванию',
  sortUnSort: 'Очистить сортировку',
  
  // ===== ПАГИНАЦИЯ =====
  page: 'Страница',
  of: 'из',
  to: 'до',
  ofBig: 'Из',
  more: 'еще',
  first: 'Первая',
  previous: 'Предыдущая',
  next: 'Следующая',
  last: 'Последняя',
  
  // ===== ЗАГРУЗКА =====
  loadingOoo: 'Загрузка...',
  
  // ===== КНОПКИ ТАБЛИЦЫ =====
  pinColumn: 'Закрепить колонку',
  pinLeft: 'Закрепить слева',
  pinRight: 'Закрепить справа',
  noPin: 'Не закреплять',
  autosizeThiscolumn: 'Автоширина этой колонки',
  autosizeAllColumns: 'Автоширина всех колонок',
  resetColumns: 'Сбросить колонки',
  
  // ===== МЕНЮ =====
  columns: 'Колонки',
  columnMenu: 'Меню колонки',
  
  // ===== ТЕКСТЫ ОШИБОК =====
  noRowsToShow: 'Нет данных для отображения',
  
  // ===== ВЫБОР СТРОК =====
  selectAll: 'Выбрать все',
  unselectAll: 'Снять выделение'
};

export { RU_LOCALE_TEXT }; // ← Явный экспорт