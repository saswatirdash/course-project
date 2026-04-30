import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  getDoc,
  addDoc, 
  deleteDoc,
  onSnapshot,
  writeBatch
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { Internship, InternshipStatus, TransactionType } from "../types";
import { coreService } from "./coreService";

export const internshipService = {
  subscribeToInternships(userId: string, callback: (internships: Internship[]) => void) {
    const path = "internships";
    const q = query(collection(db, path), where("userId", "==", userId));
    return onSnapshot(q, (snapshot) => {
      const internships = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Internship));
      callback(internships);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  async addInternship(data: Omit<Internship, 'id' | 'userId' | 'status' | 'xpAwarded' | 'createdAt'>) {
    if (!auth.currentUser) throw new Error("Unauthenticated");
    const userId = auth.currentUser.uid;
    const path = "internships";
    try {
      const newInternship: Omit<Internship, 'id'> = {
        userId,
        ...data,
        status: InternshipStatus.APPLIED,
        xpAwarded: false,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, path), newInternship);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async updateInternshipStatus(internshipId: string, status: InternshipStatus) {
    const path = "internships";
    try {
      const internRef = doc(db, path, internshipId);
      const internSnap = await getDoc(internRef);
      if (!internSnap.exists()) throw new Error("Internship not found");
      
      const internData = internSnap.data() as Internship;
      const wasCompleted = internData.status === InternshipStatus.COMPLETED;
      const isNowCompleted = status === InternshipStatus.COMPLETED;

      await updateDoc(internRef, { status });

      if (!wasCompleted && isNowCompleted && !internData.xpAwarded) {
        await updateDoc(internRef, { xpAwarded: true });
        await coreService.processManualTransaction(
          TransactionType.INTERNSHIP, 
          50, 
          `Internship Completed: ${internData.company}`
        );
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteInternship(internshipId: string) {
    const path = "internships";
    try {
      const internRef = doc(db, path, internshipId);
      const internSnap = await getDoc(internRef);
      if (internSnap.exists() && internSnap.data().xpAwarded) {
        await coreService.processManualTransaction(
          TransactionType.REVOCATION, 
          -50, 
          `Internship Revoked: ${internSnap.data().company}`
        );
      }
      await deleteDoc(internRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};
