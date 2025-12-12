import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

/**
 * Saves compressed base64 photo directly to Firestore.
 * No Firebase Storage is used (as per exam requirements).
 *
 * @param {string} base64 - compressed image in Base64 format
 * @param {string} uid - user ID
 * @returns base64 string (used as image URL)
 */
export async function uploadProfilePicture(base64, uid) {
  if (!uid || !base64) {
    throw new Error("Invalid image or user");
  }

  const userRef = doc(db, "users", uid);

  // Save base64 image directly in user document
  await setDoc(
    userRef,
    {
      photoData: base64, 
    },
    { merge: true }
  );

  return base64; 
}
