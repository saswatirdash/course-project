import { useState, useEffect } from "react";
import { semesterService } from "../services/semesterService";
import { Semester, SubjectGrade } from "../types";
import { useAuth } from "./useAuth";

export function useSemesters() {
  const { user } = useAuth();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSemesters([]);
      setLoading(false);
      return;
    }

    const unsub = semesterService.subscribeToSemesters(user.uid, (data) => {
      setSemesters(data.sort((a, b) => a.number - b.number));
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  return { semesters, loading };
}

export function useSubjectGrades(semesterId: string | null) {
  const [grades, setGrades] = useState<SubjectGrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!semesterId) {
      setGrades([]);
      setLoading(false);
      return;
    }

    const unsub = semesterService.subscribeToSubjectGrades(semesterId, (data) => {
      setGrades(data);
      setLoading(false);
    });

    return () => unsub();
  }, [semesterId]);

  return { grades, loading };
}
