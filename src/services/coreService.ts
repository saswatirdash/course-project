import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp, 
  increment,
  getDoc,
  orderBy,
  limit,
  Timestamp,
  writeBatch
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { DailyLog, Transaction, TransactionType, User, Rank } from "../types";
import { calculateRank, calculateLevel } from "../lib/stats";
import { formatDate, getISTTime } from "../lib/utils";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const coreService = {
  async setDailyTarget(hours: number) {
    if (!auth.currentUser) throw new Error("Unauthenticated");
    const userId = auth.currentUser.uid;
    const today = formatDate(getISTTime());
    const path = `dailyLogs`;

    try {
      const q = query(collection(db, path), where("userId", "==", userId), where("date", "==", today));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const logDoc = snapshot.docs[0];
        const logData = logDoc.data() as DailyLog;
        if (logData.isCompleted) throw new Error("Day is already marked as complete. Target cannot be edited.");
        const isTargetMet = logData.studyHours >= hours;
        await updateDoc(doc(db, path, logDoc.id), { 
          targetHours: hours,
          isTargetMet 
        });
      } else {
        const newLog: Omit<DailyLog, 'id'> = {
          userId,
          date: today,
          studyHours: 0,
          targetHours: hours,
          isTargetMet: false,
          winBonusClaimed: false,
          isCompleted: false
        };
        await addDoc(collection(db, path), newLog);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async logStudyHours(newHours: number) {
    if (!auth.currentUser) throw new Error("Unauthenticated");
    const userId = auth.currentUser.uid;
    const today = formatDate(getISTTime());
    const logPath = `dailyLogs`;
    const userPath = `users`;
    const transPath = `transactions`;

    try {
      const q = query(collection(db, logPath), where("userId", "==", userId), where("date", "==", today));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) throw new Error("Set a daily target first");
      
      const logDoc = snapshot.docs[0];
      const logData = logDoc.data() as DailyLog;
      
      if (logData.isCompleted) throw new Error("Day is already marked as complete. No more study hours can be logged.");

      const oldHours = logData.studyHours;
      const deltaHours = newHours - oldHours;
      
      if (deltaHours === 0) return;

      const xpDelta = Math.floor(deltaHours * 10);
      const batch = writeBatch(db);

      // Update DailyLog
      const isTargetMet = newHours >= logData.targetHours;
      let finalXpDelta = xpDelta;
      let winBonusClaimed = logData.winBonusClaimed;

      const logUpdate: any = { studyHours: newHours, isTargetMet };
      
      if (isTargetMet && !winBonusClaimed) {
        finalXpDelta += 20;
        winBonusClaimed = true;
        logUpdate.winBonusClaimed = true;
        
        // Add Win Bonus Transaction
        const bonusRef = doc(collection(db, transPath));
        batch.set(bonusRef, {
          userId,
          type: TransactionType.REWARD,
          amount: 20,
          description: "Daily Target Win Bonus",
          createdAt: new Date().toISOString()
        });
      }

      batch.update(doc(db, logPath, logDoc.id), logUpdate);

      // Add Study Transaction
      if (xpDelta !== 0) {
        const studyRef = doc(collection(db, transPath));
        batch.set(studyRef, {
          userId,
          type: TransactionType.STUDY,
          amount: xpDelta,
          description: `Studied for ${newHours} hours`,
          createdAt: new Date().toISOString()
        });
      }

      // Update User XP and Rank
      const userRef = doc(db, userPath, userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const currentBalance = userData.balance || 0;
        const currentLifetimeXp = userData.lifetimeXp || 0;
        
        const newBalance = currentBalance + finalXpDelta;
        const newLifetimeXp = currentLifetimeXp + finalXpDelta;
        const newRank = calculateRank(newLifetimeXp);
        
        batch.update(userRef, { 
          balance: newBalance, 
          lifetimeXp: newLifetimeXp, 
          rank: newRank 
        });
      }

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, logPath);
    }
  },

  async processManualTransaction(type: TransactionType, amount: number, description: string) {
    if (!auth.currentUser) throw new Error("Unauthenticated");
    const userId = auth.currentUser.uid;
    const userPath = `users`;
    const transPath = `transactions`;

    try {
      const userRef = doc(db, userPath, userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error("User not found");
      
      const userData = userSnap.data();
      const currentBalance = userData.balance || 0;
      const currentLifetimeXp = userData.lifetimeXp || 0;

      // Check for sufficient balance for shop purchases
      if (type === TransactionType.SHOP && currentBalance + amount < 0) {
        throw new Error("Insufficient XP Balance");
      }

      const batch = writeBatch(db);
      
      // Add Transaction
      const transRef = doc(collection(db, transPath));
      batch.set(transRef, {
        userId,
        type,
        amount,
        description,
        createdAt: new Date().toISOString()
      });

      // Update User
      const newBalance = currentBalance + amount;
      
      // Only REWARD, STUDY, and PUNISHMENT affect lifetimeXp (level)
      // SHOP purchases only affect balance
      let newLifetimeXp = currentLifetimeXp;
      if (type === TransactionType.REWARD || type === TransactionType.PUNISHMENT || type === TransactionType.STUDY) {
        newLifetimeXp = currentLifetimeXp + amount;
      }

      const newRank = calculateRank(newLifetimeXp);
      batch.update(userRef, { 
        balance: newBalance, 
        lifetimeXp: newLifetimeXp, 
        rank: newRank 
      });

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, transPath);
    }
  },

  async markDayAsComplete() {
    if (!auth.currentUser) throw new Error("Unauthenticated");
    const userId = auth.currentUser.uid;
    const today = formatDate(getISTTime());
    const logPath = `dailyLogs`;

    try {
      const q = query(collection(db, logPath), where("userId", "==", userId), where("date", "==", today));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) throw new Error("Set a daily target first");
      
      const logDoc = snapshot.docs[0];
      await updateDoc(doc(db, logPath, logDoc.id), { isCompleted: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, logPath);
    }
  }
};
