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
import { Subject, Chapter, TransactionType } from "../types";
import { coreService } from "./coreService";

export const syllabusService = {
  subscribeToSubjects(userId: string, callback: (subjects: Subject[]) => void) {
    const path = "subjects";
    const q = query(collection(db, path), where("userId", "==", userId));
    return onSnapshot(q, (snapshot) => {
      const subjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
      callback(subjects);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  subscribeToChapters(subjectId: string, callback: (chapters: Chapter[]) => void) {
    const path = "chapters";
    const q = query(collection(db, path), where("subjectId", "==", subjectId));
    return onSnapshot(q, (snapshot) => {
      const chapters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter));
      callback(chapters);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  async addSubject(name: string) {
    if (!auth.currentUser) throw new Error("Unauthenticated");
    const userId = auth.currentUser.uid;
    const path = "subjects";
    try {
      const newSubject: Omit<Subject, 'id'> = {
        userId,
        name,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, path), newSubject);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async addChapter(subjectId: string, name: string) {
    const path = "chapters";
    try {
      const newChapter: Omit<Chapter, 'id'> = {
        subjectId,
        name,
        isLectureDone: false,
        isDppDone: false,
        isRefBookDone: false,
        isPyqDone: false,
        isCompleted: false,
        updatedAt: new Date().toISOString()
      };
      await addDoc(collection(db, path), newChapter);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async updateChapterMastery(chapterId: string, updates: Partial<Chapter>) {
    const path = "chapters";
    try {
      const chapterRef = doc(db, path, chapterId);
      const chapterSnap = await getDoc(chapterRef);
      if (!chapterSnap.exists()) throw new Error("Chapter not found");
      
      const oldData = chapterSnap.data() as Chapter;
      const newData = { ...oldData, ...updates, updatedAt: new Date().toISOString() };
      
      // Check if newly completed
      const wasCompleted = oldData.isCompleted;
      const isNowCompleted = newData.isLectureDone && newData.isDppDone && newData.isRefBookDone && newData.isPyqDone;
      newData.isCompleted = isNowCompleted;

      await updateDoc(chapterRef, newData);

      if (!wasCompleted && isNowCompleted) {
        // Award Mastery XP
        await coreService.processManualTransaction(
          TransactionType.MASTERY, 
          10, 
          `Mastered Chapter: ${newData.name}`
        );
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteSubject(subjectId: string) {
    const path = "subjects";
    try {
      const batch = writeBatch(db);
      
      // Delete all chapters
      const q = query(collection(db, "chapters"), where("subjectId", "==", subjectId));
      const snapshot = await getDocs(q);
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Delete subject
      batch.delete(doc(db, path, subjectId));
      
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async deleteChapter(chapterId: string) {
    const path = "chapters";
    try {
      await deleteDoc(doc(db, path, chapterId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};
