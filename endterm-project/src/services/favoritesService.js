import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

export const getFavoritesFromFirestore = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().favorites || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting favorites from Firestore:', error);
    throw error;
  }
};

export const saveFavoritesToFirestore = async (userId, favorites) => {
  try {
    await setDoc(
      doc(db, 'users', userId),
      { favorites },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Error saving favorites to Firestore:', error);
    throw error;
  }
};


export const addFavoriteToFirestore = async (userId, showId) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      favorites: arrayUnion(showId)
    });
    return true;
  } catch (error) {
    console.error('Error adding favorite to Firestore:', error);
    throw error;
  }
};


export const removeFavoriteFromFirestore = async (userId, showId) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      favorites: arrayRemove(showId)
    });
    return true;
  } catch (error) {
    console.error('Error removing favorite from Firestore:', error);
    throw error;
  }
};


export const mergeFavorites = async (userId, localFavorites) => {
  try {
    const serverFavorites = await getFavoritesFromFirestore(userId);
  
    const mergedFavorites = [...new Set([...serverFavorites, ...localFavorites])];
    
    await saveFavoritesToFirestore(userId, mergedFavorites);
    
    return {
      success: true,
      merged: mergedFavorites,
      localCount: localFavorites.length,
      serverCount: serverFavorites.length,
      mergedCount: mergedFavorites.length
    };
  } catch (error) {
    console.error('Error merging favorites:', error);
    throw error;
  }
};