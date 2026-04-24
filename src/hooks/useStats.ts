import { useState, useEffect } from "react";
import { statsService } from "../services/statsService";
import { User, DailyLog, Transaction, Roadmap } from "../types";
import { useAuth } from "./useAuth";
import { formatDate, getISTTime } from "../lib/utils";

export function useStats() {
  const { user: authUser } = useAuth();
  const [userStats, setUserStats] = useState<User | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(formatDate(getISTTime()));

  useEffect(() => {
    // Update currentDate at midnight
    const now = getISTTime();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timer = setTimeout(() => {
      setCurrentDate(formatDate(getISTTime()));
    }, msUntilMidnight + 1000); 

    return () => clearTimeout(timer);
  }, [currentDate]);

  useEffect(() => {
    if (!authUser) {
      setUserStats(null);
      setTodayLog(null);
      setRecentTransactions([]);
      setRoadmaps([]);
      setLoading(false);
      return;
    }

    const unsubStats = statsService.subscribeToUserStats(authUser.uid, setUserStats);
    const unsubLog = statsService.subscribeToTodayLog(authUser.uid, setTodayLog, currentDate);
    const unsubTrans = statsService.subscribeToRecentTransactions(authUser.uid, setRecentTransactions);
    const unsubRoadmaps = statsService.subscribeToRoadmaps(authUser.uid, setRoadmaps);

    setLoading(false);

    return () => {
      unsubStats();
      unsubLog();
      unsubTrans();
      unsubRoadmaps();
    };
  }, [authUser, currentDate]);

  return { userStats, todayLog, recentTransactions, roadmaps, loading, currentDate };
}
