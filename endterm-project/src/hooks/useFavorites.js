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

  // Локальное хранение для гостей
  const { value: localFavorites, setValue: setLocalFavorites, removeValue: clearLocalFavorites } =
    useLocalStorage(FAVORITES_STORAGE_KEY, []);

  // ====== useMemo для производных значений ======
  const favoritesCount = useMemo(() => favorites.length, [favorites]);
  const hasLocalFavorites = useMemo(() => localFavorites.length > 0, [localFavorites]);
  const localFavoritesCount = useMemo(() => localFavorites.length, [localFavorites]);
  const isGuest = useMemo(() => !user, [user]);

  // ====== Загрузка избранного ======
  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (user) {
        const serverFavorites = await favoritesService.getFavoritesFromFirestore(user.uid);
        setFavorites(serverFavorites);

        if (localFavorites.length > 0) {
          setMergeMessage(`You have ${localFavorites.length} local favorites. Login to sync them.`);
        }
      } else {
        setFavorites(localFavorites);
      }
    } catch (err) {
      setError('Failed to load favorites: ' + err.message);
      console.error('Error loading favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [user, localFavorites]);

  useEffect(() => {
    if (!authLoading) loadFavorites();
  }, [user, authLoading, loadFavorites]);

  // ====== Добавление / удаление / переключение ======
  const addFavorite = useCallback(async (showId) => { /* ... */ }, [user, localFavorites, setLocalFavorites]);
  const removeFavorite = useCallback(async (showId) => { /* ... */ }, [user, localFavorites, setLocalFavorites]);
  const toggleFavorite = useCallback(async (showId) => { /* ... */ }, [favorites, addFavorite, removeFavorite]);
  const isFavorite = useCallback((showId) => favorites.includes(showId), [favorites]);

  // ====== Слияние локального и серверного избранного ======
  const mergeWithServer = useCallback(async () => { /* ... */ }, [user, localFavorites, clearLocalFavorites]);

  // ====== Очистка всех избранных ======
  const clearAllFavorites = useCallback(async () => { /* ... */ }, [user, clearLocalFavorites]);

  return {
    favorites,
    loading,
    error,
    mergeMessage,
    favoritesCount,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    mergeWithServer,
    clearAllFavorites,
    reloadFavorites: loadFavorites,
    isGuest,
    hasLocalFavorites,
    localFavoritesCount
  };
};

export default useFavorites;
