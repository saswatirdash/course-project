import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { BtechYear, Rank, User } from "../types";

const googleProvider = new GoogleAuthProvider();

export const authService = {
  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // This is a new user, but we need year and branch. 
        // We'll handle this in the UI by redirecting to a setup page if needed.
        // For now, create a default profile.
        const newUser: User = {
          id: user.uid,
          email: user.email || "",
          name: user.displayName || "BTech Buddy",
          btechYear: BtechYear.FIRST,
          lifetimeXp: 0,
          balance: 0,
          rank: Rank.BEGINNER,
          streak: 0,
          createdAt: new Date().toISOString()
        };
        await setDoc(userRef, newUser);
      }
      return user;
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        return null;
      }
      if (error.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        console.error("Unauthorized Domain:", domain);
        const errorMsg = `Login Blocked: "${domain}" is not an authorized domain in Firebase. \n\nTo fix this:\n1. Go to Firebase Console\n2. Navigate to Auth > Settings > Authorized Domains\n3. Add "${domain}" to the list.`;
        throw new Error(errorMsg);
      }
      console.error("Google Login Error:", error);
      throw error;
    }
  },

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
      throw error;
    }
  },

  async updateUserProfile(userId: string, data: Partial<User>) {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, data, { merge: true });
  }
};
