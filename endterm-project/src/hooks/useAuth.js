import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { getUserProfile } from '../services/profileService';

export const useAuth = () => {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    // Подписка на изменения авторизации
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Загружаем дополнительные данные пользователя из Firestore
        const profileResult = await getUserProfile(firebaseUser.uid);

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || profileResult.profile?.displayName,
          photoURL: profileResult.profile?.photoData || firebaseUser.photoURL
        });
      } else {
        setUser(null);
      }
      setLoading(false); 
    });

    return unsubscribe; 
  }, []);

  return { user, loading };
};
