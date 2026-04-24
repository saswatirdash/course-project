import { useState, useEffect } from "react";
import { certificationService } from "../services/certificationService";
import { Certification } from "../types";
import { useAuth } from "./useAuth";

export function useCertifications() {
  const { user } = useAuth();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCertifications([]);
      setLoading(false);
      return;
    }

    const unsub = certificationService.subscribeToCertifications(user.uid, (data) => {
      setCertifications(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  return { certifications, loading };
}
