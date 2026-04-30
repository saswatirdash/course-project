import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  orderBy, 
  limit, 
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  writeBatch,
  deleteField,
  serverTimestamp
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { DailyLog, Transaction, User, TransactionType, Roadmap, RoadmapStatus, RoadmapSession } from "../types";
import { formatDate, getISTTime } from "../lib/utils";

export const statsService = {
  async archiveRoadmap(roadmapId: string) {
    const path = "roadmaps";
    try {
      const ref = doc(db, path, roadmapId);
      await updateDoc(ref, { isArchived: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async createRoadmap(data: Omit<Roadmap, 'id'>) {
    const path = "roadmaps";
    try {
      await addDoc(collection(db, path), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async updateRoadmapSession(roadmapId: string, sessions: RoadmapSession[]) {
    const path = "roadmaps";
    try {
      const ref = doc(db, path, roadmapId);
      await updateDoc(ref, { sessions });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  subscribeToRoadmaps(userId: string, callback: (roadmaps: Roadmap[]) => void) {
    const path = "roadmaps";
    const q = query(
      collection(db, path),
      where("userId", "==", userId),
      where("isArchived", "==", false),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const roadmaps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Roadmap));
      callback(roadmaps);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  async updateUserStats(userId: string, data: Partial<User>) {
    const path = "users";
    try {
      const userRef = doc(db, path, userId);
      await updateDoc(userRef, data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async resetUserData(userId: string) {
    try {
      const allRefs: any[] = [];
      const handledDocIds = new Set<string>();

      const addRef = (doc: any) => {
        if (!handledDocIds.has(doc.id)) {
          allRefs.push(doc.ref);
          handledDocIds.add(doc.id);
        }
      };
      
      // 1. Specialized collection of Chapters (which don't have userId and rely on Subject)
      // Collect these FIRST to ensure they are at the beginning of the deletion list
      const subjectsQ = query(collection(db, "subjects"), where("userId", "==", userId));
      const subjectsSnap = await getDocs(subjectsQ);
      
      for (const subjectDoc of subjectsSnap.docs) {
        const chaptersQ = query(collection(db, "chapters"), where("subjectId", "==", subjectDoc.id));
        const chaptersSnap = await getDocs(chaptersQ);
        chaptersSnap.docs.forEach(addRef);
      }

      // 2. Collect all other document references to delete (including subjects)
      const userOwnedCollections = [
        "subjects",
        "semesters",
        "subjectGrades",
        "dailyLogs",
        "transactions",
        "certifications",
        "internships",
        "roadmaps"
      ];

      for (const collName of userOwnedCollections) {
        const q = query(collection(db, collName), where("userId", "==", userId));
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(addRef);
      }

      // 3. Process deletions in batches (max 500 per batch, 400 for safety)
      // Because chapters were added first, they will be in earlier batches than subjects
      const CHUNK_SIZE = 400;
      for (let i = 0; i < allRefs.length; i += CHUNK_SIZE) {
        const chunk = allRefs.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach(ref => batch.delete(ref));
        await batch.commit();
      }

      // 4. Reset user stats in a final single operation
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      const currentData = userSnap.exists() ? userSnap.data() : {};

      await updateDoc(userRef, {
        lifetimeXp: 0,
        balance: 0,
        rank: "BEGINNER",
        streak: 0,
        lastStudyDate: deleteField(),
        btechYear: "FIRST",
        branch: deleteField(),
        image: deleteField(),
        github: deleteField(),
        linkedin: deleteField(),
        twitter: deleteField(),
        createdAt: currentData.createdAt || new Date().toISOString(), // Keep original or set new if missing
        updatedAt: serverTimestamp()
      });

    } catch (error) {
      console.error("Critical Profile Reset Error:", error);
      handleFirestoreError(error, OperationType.WRITE, "resetUserData");
    }
  },

  subscribeToUserStats(userId: string, callback: (user: User | null) => void) {
    const path = `users/${userId}`;
    const userRef = doc(db, "users", userId);
    return onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as User);
      } else {
        callback(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  subscribeToTodayLog(userId: string, callback: (log: DailyLog | null) => void, date?: string) {
    const path = "dailyLogs";
    const today = date || formatDate(getISTTime());
    const q = query(
      collection(db, path), 
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
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  subscribeToRecentTransactions(userId: string, callback: (transactions: Transaction[]) => void) {
    const path = "transactions";
    const q = query(
      collection(db, path),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      callback(transactions);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  subscribeToHistoricalData(userId: string, callback: (data: { logs: DailyLog[], transactions: Transaction[] }) => void) {
    const path = "historicalData";
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
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "dailyLogs");
    });

    const unsubTrans = onSnapshot(transQ, (snapshot) => {
      transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      callback({ logs, transactions });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "transactions");
    });

    return () => {
      unsubLogs();
      unsubTrans();
    };
  }
};
