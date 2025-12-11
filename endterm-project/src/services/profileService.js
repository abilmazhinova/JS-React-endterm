import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export const saveUserProfile = async (userId, profileData) => {
  try {
    await setDoc(doc(db, 'users', userId), profileData, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error saving profile:', error);
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { success: true, profile: userDoc.data() };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error getting profile:', error);
    return { success: false, error: error.message };
  }
};

export const updateProfilePicture = async (userId, photoData) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      photoData: photoData, 
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return { success: false, error: error.message };
  }
};