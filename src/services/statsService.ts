import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  writeBatch,
  deleteField
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { DailyLog, Transaction, User, TransactionType, Roadmap, RoadmapStatus, RoadmapSession } from "../types";
import { formatDate, getISTTime } from "../lib/utils";

export const statsService = {
  // ... existing methods ...
  async archiveRoadmap(roadmapId: string) {
    const ref = doc(db, "roadmaps", roadmapId);
    await updateDoc(ref, { isArchived: true });
  },

  async createRoadmap(data: Omit<Roadmap, 'id'>) {
    await addDoc(collection(db, "roadmaps"), data);
  },

  async updateRoadmapSession(roadmapId: string, sessions: RoadmapSession[]) {
    const ref = doc(db, "roadmaps", roadmapId);
    await updateDoc(ref, { sessions });
  },

  subscribeToRoadmaps(userId: string, callback: (roadmaps: Roadmap[]) => void) {
    const q = query(
      collection(db, "roadmaps"),
      where("userId", "==", userId),
      where("isArchived", "==", false),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const roadmaps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Roadmap));
      callback(roadmaps);
    }, (error) => {
      console.error("Roadmaps subscription error:", error);
    });
  },

  async updateUserStats(userId: string, data: Partial<User>) {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, data);
  },

  async resetUserData(userId: string) {
    const batch = writeBatch(db);
    
    // 1. Delete Chapters (nested under subjects)
    const subjectsQ = query(collection(db, "subjects"), where("userId", "==", userId));
    const subjectsSnap = await getDocs(subjectsQ);
    for (const subjectDoc of subjectsSnap.docs) {
      const chaptersQ = query(collection(db, "chapters"), where("subjectId", "==", subjectDoc.id));
      const chaptersSnap = await getDocs(chaptersQ);
      chaptersSnap.docs.forEach(doc => batch.delete(doc.ref));
      batch.delete(subjectDoc.ref);
    }

    // 2. Delete SubjectGrades (nested under semesters)
    const semestersQ = query(collection(db, "semesters"), where("userId", "==", userId));
    const semestersSnap = await getDocs(semestersQ);
    for (const semesterDoc of semestersSnap.docs) {
      const gradesQ = query(collection(db, "subjectGrades"), where("semesterId", "==", semesterDoc.id));
      const gradesSnap = await getDocs(gradesQ);
      gradesSnap.docs.forEach(doc => batch.delete(doc.ref));
      batch.delete(semesterDoc.ref);
    }

    // 3. Delete other user-owned collections
    const collections = [
      "dailyLogs",
      "transactions",
      "certifications",
      "internships"
    ];

    for (const collName of collections) {
      const q = query(collection(db, collName), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
    }

    // 4. Reset user stats but keep the user document (name and email)
    const userRef = doc(db, "users", userId);
    batch.update(userRef, {
      lifetimeXp: 0,
      balance: 0,
      rank: "BEGINNER",
      streak: 0,
      lastStudyDate: null,
      btechYear: "FIRST",
      branch: deleteField(),
      image: deleteField(),
      createdAt: new Date().toISOString(),
    });

    await batch.commit();
  },

  subscribeToUserStats(userId: string, callback: (user: User | null) => void) {
    const userRef = doc(db, "users", userId);
    return onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as User);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error("User stats subscription error:", error);
    });
  },

  subscribeToTodayLog(userId: string, callback: (log: DailyLog | null) => void, date?: string) {
    const today = date || formatDate(getISTTime());
    const q = query(
      collection(db, "dailyLogs"), 
      where("userId", "==", userId), 
      where("date", "==", today)
    );
    
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        callback({ id: doc.id, ...doc.data() } as DailyLog);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error("Today log subscription error:", error);
    });
  },

  subscribeToRecentTransactions(userId: string, callback: (transactions: Transaction[]) => void) {
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      callback(transactions);
    }, (error) => {
      console.error("Recent transactions subscription error:", error);
    });
  },

  subscribeToHistoricalData(userId: string, callback: (data: { logs: DailyLog[], transactions: Transaction[] }) => void) {
    const logsQ = query(
      collection(db, "dailyLogs"),
      where("userId", "==", userId),
      orderBy("date", "desc"),
      limit(7)
    );

    const transQ = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      where("type", "==", TransactionType.PUNISHMENT),
      orderBy("createdAt", "desc"),
      limit(100) // Increased limit to ensure we cover the week
    );

    let logs: DailyLog[] = [];
    let transactions: Transaction[] = [];

    const unsubLogs = onSnapshot(logsQ, (snapshot) => {
      logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyLog));
      callback({ logs, transactions });
    });

    const unsubTrans = onSnapshot(transQ, (snapshot) => {
      transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      callback({ logs, transactions });
    });

    return () => {
      unsubLogs();
      unsubTrans();
    };
  }
};
