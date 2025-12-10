import { auth, storage, db } from "../firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";

export async function uploadProfilePicture(file, userId) {
  const storageRef = ref(storage, `profilePictures/${userId}.jpg`);

  // Загружаем в Storage
  await uploadBytes(storageRef, file);

  // Получаем URL
  const url = await getDownloadURL(storageRef);

  // Сохраняем в Firestore
  await updateDoc(doc(db, "users", userId), {
    photoURL: url,
  });

  // Обновляем Firebase auth user
  await updateProfile(auth.currentUser, {
    photoURL: url,
  });

  return url;
}
