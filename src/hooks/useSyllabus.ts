import { useState, useEffect } from "react";
import { syllabusService } from "../services/syllabusService";
import { Subject, Chapter } from "../types";
import { useAuth } from "./useAuth";

export function useSyllabus() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubjects([]);
      setLoading(false);
      return;
    }

    const unsub = syllabusService.subscribeToSubjects(user.uid, (data) => {
      setSubjects(data);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  return { subjects, loading };
}

export function useChapters(subjectId: string | null) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subjectId) {
      setChapters([]);
      setLoading(false);
      return;
    }

    const unsub = syllabusService.subscribeToChapters(subjectId, (data) => {
      setChapters(data);
      setLoading(false);
    });

    return () => unsub();
  }, [subjectId]);

  return { chapters, loading };
}
