import { useState, useEffect } from 'react';

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value); // Обновляем значение через delay
    }, delay);

    return () => clearTimeout(handler); 
  }, [value, delay]);

  return debouncedValue;
};
