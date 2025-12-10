// ВОТ ЭТО НЕПРАВИЛЬНО - в конце файла ты пишешь еще один useLocalStorage
// Убери дублирование!

// Правильный useLocalStorage.js:
import { useState, useEffect, useCallback } from 'react';

const useLocalStorage = (key, initialValue) => {
  // Функция для инициализации состояния
  const getInitialValue = () => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState(getInitialValue);

  // Обновляем localStorage при изменении значения
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Функция для обновления значения
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      return { success: true };
    } catch (error) {
      console.error(`Error updating localStorage key "${key}":`, error);
      return { success: false, error: error.message };
    }
  }, [storedValue, key]);

  // Функция для удаления значения
  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
      return { success: true };
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return { success: false, error: error.message };
    }
  }, [key, initialValue]);

  // Функция для очистки всех избранных (опционально)
  const clearFavorites = useCallback(() => {
    return removeValue();
  }, [removeValue]);

  return {
    value: storedValue,
    setValue,
    removeValue,
    clearFavorites
  };
};

export default useLocalStorage;
// КОНЕЦ ФАЙЛА - больше ничего не добавляй!