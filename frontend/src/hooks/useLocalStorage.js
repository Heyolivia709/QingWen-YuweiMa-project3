import { useEffect, useState } from 'react';

function readStorage(key, defaultValue) {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Failed to read localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export default function useLocalStorage(key, defaultValue) {
  const [storedValue, setStoredValue] = useState(() => readStorage(key, defaultValue));

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Failed to set localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
