import { useState, useEffect } from "react";
import { internshipService } from "../services/internshipService";
import { Internship } from "../types";
import { useAuth } from "./useAuth";

export function useInternships() {
  const { user } = useAuth();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setInternships([]);
      setLoading(false);
      return;
    }

    const unsub = internshipService.subscribeToInternships(user.uid, (data) => {
      setInternships(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  return { internships, loading };
}
