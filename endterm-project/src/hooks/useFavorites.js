import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import useLocalStorage from './useLocalStorage';
import * as favoritesService from '../services/favoritesService';

const FAVORITES_STORAGE_KEY = 'tvmaze_favorites';

const useFavorites = () => {
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mergeMessage, setMergeMessage] = useState('');
  
  // Используем наш хук для localStorage
  const {
    value: localFavorites,
    setValue: setLocalFavorites,
    removeValue: clearLocalFavorites
  } = useLocalStorage(FAVORITES_STORAGE_KEY, []);

  // ========== useMemo: производные значения ==========
  const favoritesCount = useMemo(() => favorites.length, [favorites]);
  const hasLocalFavorites = useMemo(() => localFavorites.length > 0, [localFavorites]);
  const localFavoritesCount = useMemo(() => localFavorites.length, [localFavorites]);
  const isGuest = useMemo(() => !user, [user]);

  // Загружаем избранное в зависимости от статуса пользователя
  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      if (user) {
        // Для авторизованных пользователей: загружаем из Firestore
        const serverFavorites = await favoritesService.getFavoritesFromFirestore(user.uid);
        setFavorites(serverFavorites);
        
        // Если есть локальные избранные, предлагаем слияние
        if (localFavorites.length > 0) {
          setMergeMessage(`You have ${localFavorites.length} local favorites. Login to sync them.`);
        }
      } else {
        // Для гостей: используем localStorage
        setFavorites(localFavorites);
      }
    } catch (err) {
      setError('Failed to load favorites: ' + err.message);
      console.error('Error loading favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [user, localFavorites]);

  // Эффект для загрузки избранного при изменении пользователя
  useEffect(() => {
    if (!authLoading) {
      loadFavorites();
    }
  }, [user, authLoading, loadFavorites]);

  // Добавить в избранное
  const addFavorite = useCallback(async (showId) => {
    try {
      if (user) {
        // Для авторизованных: добавляем в Firestore
        await favoritesService.addFavoriteToFirestore(user.uid, showId);
        
        // Обновляем локальное состояние
        setFavorites(prev => {
          const updated = [...prev, showId];
          return updated;
        });
      } else {
        // Для гостей: добавляем в localStorage
        const updatedFavorites = [...localFavorites, showId];
        setLocalFavorites(updatedFavorites);
        setFavorites(updatedFavorites);
      }
      
      return { success: true };
    } catch (err) {
      const errorMsg = 'Failed to add to favorites: ' + err.message;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [user, localFavorites, setLocalFavorites]);

  // Удалить из избранного
  const removeFavorite = useCallback(async (showId) => {
    try {
      if (user) {
        // Для авторизованных: удаляем из Firestore
        await favoritesService.removeFavoriteFromFirestore(user.uid, showId);
        
        // Обновляем локальное состояние
        setFavorites(prev => prev.filter(id => id !== showId));
      } else {
        // Для гостей: удаляем из localStorage
        const updatedFavorites = localFavorites.filter(id => id !== showId);
        setLocalFavorites(updatedFavorites);
        setFavorites(updatedFavorites);
      }
      
      return { success: true };
    } catch (err) {
      const errorMsg = 'Failed to remove from favorites: ' + err.message;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [user, localFavorites, setLocalFavorites]);

  // Переключить избранное (добавить/удалить)
  const toggleFavorite = useCallback(async (showId) => {
    const isCurrentlyFavorite = favorites.includes(showId);
    
    if (isCurrentlyFavorite) {
      return await removeFavorite(showId);
    } else {
      return await addFavorite(showId);
    }
  }, [favorites, addFavorite, removeFavorite]);

  // Проверить, находится ли в избранном
  const isFavorite = useCallback((showId) => {
    return favorites.includes(showId);
  }, [favorites]);

  // Слияние локальных и серверных избранных при логине
  const mergeWithServer = useCallback(async () => {
    if (!user || localFavorites.length === 0) {
      return { success: false, message: 'No local favorites to merge' };
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await favoritesService.mergeFavorites(user.uid, localFavorites);
      
      if (result.success) {
        // Очищаем локальные избранные
        clearLocalFavorites();
        
        // Обновляем состояние
        setFavorites(result.merged);
        
        // Показываем сообщение
        setMergeMessage(`Your ${result.localCount} local favorites were merged with your account.`);
        
        // Автоматически скрываем сообщение через 5 секунд
        setTimeout(() => {
          setMergeMessage('');
        }, 5000);
        
        return {
          success: true,
          message: `Successfully merged ${result.localCount} local favorites with ${result.serverCount} server favorites`,
          ...result
        };
      }
      
      return result;
    } catch (err) {
      const errorMsg = 'Failed to merge favorites: ' + err.message;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [user, localFavorites, clearLocalFavorites]);

  // Очистить все избранное
  const clearAllFavorites = useCallback(async () => {
    try {
      if (user) {
        // Для авторизованных: очищаем в Firestore
        await favoritesService.saveFavoritesToFirestore(user.uid, []);
      } else {
        // Для гостей: очищаем localStorage
        clearLocalFavorites();
      }
      
      setFavorites([]);
      setError('');
      return { success: true };
    } catch (err) {
      const errorMsg = 'Failed to clear favorites: ' + err.message;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [user, clearLocalFavorites]);

  return {
    // Состояние
    favorites,
    loading,
    error,
    mergeMessage,
    favoritesCount, // теперь useMemo
    
    // Методы
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    mergeWithServer,
    clearAllFavorites,
    reloadFavorites: loadFavorites,
    
    // Информация о состоянии (теперь useMemo)
    isGuest,
    hasLocalFavorites,
    localFavoritesCount
  };
};

export default useFavorites;