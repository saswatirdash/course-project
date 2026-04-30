import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDoc
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { Semester, SubjectGrade, TransactionType } from "../types";
import { calculateGPA, calculateCGPA } from "../lib/stats";
import { coreService } from "./coreService";

export const semesterService = {
  subscribeToSemesters(userId: string, callback: (semesters: Semester[]) => void) {
    const path = "semesters";
    const q = query(collection(db, path), where("userId", "==", userId));
    return onSnapshot(q, (snapshot) => {
      const semesters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Semester));
      callback(semesters);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  subscribeToSubjectGrades(semesterId: string, callback: (grades: SubjectGrade[]) => void) {
    if (!auth.currentUser) return () => {};
    const path = "subjectGrades";
    const q = query(collection(db, path), 
      where("semesterId", "==", semesterId),
      where("userId", "==", auth.currentUser.uid)
    );
    return onSnapshot(q, (snapshot) => {
      const grades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubjectGrade));
      callback(grades);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  subscribeToBacklogs(userId: string, callback: (grades: SubjectGrade[]) => void) {
    const path = "subjectGrades";
    const q = query(collection(db, path), 
      where("userId", "==", userId),
      where("hasBacklog", "==", true)
    );
    return onSnapshot(q, (snapshot) => {
      const grades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubjectGrade));
      callback(grades);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  async addSemester(number: number) {
    if (!auth.currentUser) throw new Error("Unauthenticated");
    const userId = auth.currentUser.uid;
    const path = "semesters";
    
    try {
      // Deactivate others
      const q = query(collection(db, path), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => batch.update(doc.ref, { isActive: false }));
      
      const newSemester: Omit<Semester, 'id'> = {
        userId,
        number,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      const semRef = doc(collection(db, path));
      batch.set(semRef, newSemester);
      
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async addSubjectGrade(semesterId: string, data: Omit<SubjectGrade, 'id' | 'semesterId' | 'userId'>) {
    if (!auth.currentUser) throw new Error("Unauthenticated");
    const path = "subjectGrades";
    try {
      const newGrade: Omit<SubjectGrade, 'id'> = {
        semesterId,
        userId: auth.currentUser.uid,
        ...data
      };
      await addDoc(collection(db, path), newGrade);
      
      // Recalculate Semester GPA
      await this.recalculateSemesterGPA(semesterId);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async setActiveSemester(semesterId: string) {
    if (!auth.currentUser) throw new Error("Unauthenticated");
    const userId = auth.currentUser.uid;
    const path = "semesters";
    
    try {
      // Deactivate others
      const q = query(collection(db, path), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => batch.update(doc.ref, { isActive: false }));
      
      // Activate current
      batch.update(doc(db, path, semesterId), { isActive: true });
      
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async recalculateSemesterGPA(semesterId: string) {
    if (!auth.currentUser) return;
    const path = "subjectGrades";
    try {
      const q = query(collection(db, path), 
        where("semesterId", "==", semesterId),
        where("userId", "==", auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const grades = snapshot.docs.map(doc => doc.data() as SubjectGrade);
      const gpa = calculateGPA(grades);
      
      await updateDoc(doc(db, "semesters", semesterId), { gpa });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async markBacklog(gradeId: string, hasBacklog: boolean) {
    const path = "subjectGrades";
    try {
      await updateDoc(doc(db, path, gradeId), { hasBacklog });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteSemester(semesterId: string) {
    if (!auth.currentUser) throw new Error("Unauthenticated");
    const path = "semesters";
    
    try {
      // Delete all subject grades for this semester (only for current user)
      const q = query(collection(db, "subjectGrades"), 
        where("semesterId", "==", semesterId),
        where("userId", "==", auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Delete the semester itself
      batch.delete(doc(db, path, semesterId));
      
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async deleteSubjectGrade(gradeId: string, semesterId: string) {
    const path = "subjectGrades";
    try {
      await deleteDoc(doc(db, path, gradeId));
      await this.recalculateSemesterGPA(semesterId);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};
