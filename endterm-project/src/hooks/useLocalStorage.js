import { useState, useEffect, useCallback } from 'react';

const useLocalStorage = (key, initialValue) => {
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

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

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

  return { value: storedValue, setValue, removeValue };
};

export default useLocalStorage;
