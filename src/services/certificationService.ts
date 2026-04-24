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
import { db, auth } from "../firebase";
import { Certification, CertStatus, TransactionType } from "../types";
import { coreService } from "./coreService";

export const certificationService = {
  subscribeToCertifications(userId: string, callback: (certs: Certification[]) => void) {
    const q = query(collection(db, "certifications"), where("userId", "==", userId));
    return onSnapshot(q, (snapshot) => {
      const certs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Certification));
      callback(certs);
    }, (error) => {
      console.error("Certifications subscription error:", error);
    });
  },

  async addCertification(title: string, provider: string, url?: string) {
    if (!auth.currentUser) throw new Error("Unauthenticated");
    const userId = auth.currentUser.uid;
    const newCert: Omit<Certification, 'id'> = {
      userId,
      title,
      provider,
      url,
      status: CertStatus.IN_PROGRESS,
      xpAwarded: false,
      createdAt: new Date().toISOString()
    };
    await addDoc(collection(db, "certifications"), newCert);
  },

  async completeCertification(certId: string) {
    const certRef = doc(db, "certifications", certId);
    const certSnap = await getDoc(certRef);
    if (!certSnap.exists()) throw new Error("Certification not found");
    
    const certData = certSnap.data() as Certification;
    if (certData.status === CertStatus.COMPLETED) return;

    await updateDoc(certRef, { 
      status: CertStatus.COMPLETED, 
      completedAt: new Date().toISOString(),
      xpAwarded: true
    });

    if (!certData.xpAwarded) {
      await coreService.processManualTransaction(
        TransactionType.CERTIFICATION, 
        30, 
        `Certification Completed: ${certData.title}`
      );
    }
  },

  async deleteCertification(certId: string) {
    const certRef = doc(db, "certifications", certId);
    const certSnap = await getDoc(certRef);
    if (certSnap.exists() && certSnap.data().xpAwarded) {
      await coreService.processManualTransaction(
        TransactionType.REVOCATION, 
        -30, 
        `Certification Revoked: ${certSnap.data().title}`
      );
    }
    await deleteDoc(certRef);
  }
};
