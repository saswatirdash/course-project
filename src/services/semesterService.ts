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
import { db, auth } from "../firebase";
import { Semester, SubjectGrade, TransactionType } from "../types";
import { calculateGPA, calculateCGPA } from "../lib/stats";
import { coreService } from "./coreService";

export const semesterService = {
  subscribeToSemesters(userId: string, callback: (semesters: Semester[]) => void) {
    const q = query(collection(db, "semesters"), where("userId", "==", userId));
    return onSnapshot(q, (snapshot) => {
      const semesters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Semester));
      callback(semesters);
    }, (error) => {
      console.error("Semesters subscription error:", error);
    });
  },

  subscribeToSubjectGrades(semesterId: string, callback: (grades: SubjectGrade[]) => void) {
    const q = query(collection(db, "subjectGrades"), where("semesterId", "==", semesterId));
    return onSnapshot(q, (snapshot) => {
      const grades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubjectGrade));
      callback(grades);
    }, (error) => {
      console.error("SubjectGrades subscription error:", error);
    });
  },

  async addSemester(number: number) {
    if (!auth.currentUser) throw new Error("Unauthenticated");
    const userId = auth.currentUser.uid;
    
    // Deactivate others
    const q = query(collection(db, "semesters"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => batch.update(doc.ref, { isActive: false }));
    
    const newSemester: Omit<Semester, 'id'> = {
      userId,
      number,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    const semRef = doc(collection(db, "semesters"));
    batch.set(semRef, newSemester);
    
    await batch.commit();
  },

  async addSubjectGrade(semesterId: string, data: Omit<SubjectGrade, 'id' | 'semesterId'>) {
    const newGrade: Omit<SubjectGrade, 'id'> = {
      semesterId,
      ...data
    };
    await addDoc(collection(db, "subjectGrades"), newGrade);
    
    // Recalculate Semester GPA
    await this.recalculateSemesterGPA(semesterId);
  },

  async setActiveSemester(semesterId: string) {
    if (!auth.currentUser) throw new Error("Unauthenticated");
    const userId = auth.currentUser.uid;
    
    // Deactivate others
    const q = query(collection(db, "semesters"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => batch.update(doc.ref, { isActive: false }));
    
    // Activate current
    batch.update(doc(db, "semesters", semesterId), { isActive: true });
    
    await batch.commit();
  },

  async recalculateSemesterGPA(semesterId: string) {
    const q = query(collection(db, "subjectGrades"), where("semesterId", "==", semesterId));
    const snapshot = await getDocs(q);
    const grades = snapshot.docs.map(doc => doc.data() as SubjectGrade);
    const gpa = calculateGPA(grades);
    
    await updateDoc(doc(db, "semesters", semesterId), { gpa });
  },

  async markBacklog(gradeId: string, hasBacklog: boolean) {
    await updateDoc(doc(db, "subjectGrades", gradeId), { hasBacklog });
  }
};
