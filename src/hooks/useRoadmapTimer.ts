import { useState, useEffect } from "react";
import { Roadmap, RoadmapSession, RoadmapStatus } from "../types";
import { statsService } from "../services/statsService";

export function useRoadmapTimer(activeRoadmap: Roadmap | null) {
  const [localSessions, setLocalSessions] = useState<RoadmapSession[]>([]);

  useEffect(() => {
    if (activeRoadmap) {
      setLocalSessions(activeRoadmap.sessions);
    }
  }, [activeRoadmap]);

  useEffect(() => {
    const ongoingSession = localSessions.find(s => s.status === RoadmapStatus.ONGOING);
    if (!ongoingSession) return;

    const interval = setInterval(() => {
      setLocalSessions(prev => prev.map(s => {
        if (s.status === RoadmapStatus.ONGOING) {
          return { ...s, elapsedSeconds: s.elapsedSeconds + 1 };
        }
        return s;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [localSessions]);

  const toggleSession = async (sessionId: string) => {
    if (!activeRoadmap) return;

    const newSessions = localSessions.map(s => {
      // If clicking on this session
      if (s.id === sessionId) {
        if (s.status === RoadmapStatus.PENDING || s.status === RoadmapStatus.PAUSED) {
          return { ...s, status: RoadmapStatus.ONGOING, lastStartedAt: new Date().toISOString() };
        } else if (s.status === RoadmapStatus.ONGOING) {
          return { ...s, status: RoadmapStatus.PAUSED };
        }
      } 
      // If another session was ongoing, pause it
      else if (s.status === RoadmapStatus.ONGOING) {
        return { ...s, status: RoadmapStatus.PAUSED };
      }
      return s;
    });

    setLocalSessions(newSessions);
    await statsService.updateRoadmapSession(activeRoadmap.id, newSessions);
  };

  const markComplete = async (sessionId: string) => {
    if (!activeRoadmap) return;

    const newSessions = localSessions.map(s => {
      if (s.id === sessionId) {
        return { ...s, status: RoadmapStatus.COMPLETED };
      }
      return s;
    });

    setLocalSessions(newSessions);
    await statsService.updateRoadmapSession(activeRoadmap.id, newSessions);
  };

  const resetSession = async (sessionId: string) => {
     if (!activeRoadmap) return;

    const newSessions = localSessions.map(s => {
      if (s.id === sessionId) {
        return { ...s, status: RoadmapStatus.PENDING, elapsedSeconds: 0, lastStartedAt: null };
      }
      return s;
    });

    setLocalSessions(newSessions);
    await statsService.updateRoadmapSession(activeRoadmap.id, newSessions);
  };

  return { sessions: localSessions, toggleSession, markComplete, resetSession };
}
