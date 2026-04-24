import React, { useEffect, useState, useMemo } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { statsService } from "../../services/statsService";
import { useAuth } from "../../hooks/useAuth";
import { useStats } from "../../hooks/useStats";
import { DailyLog, Transaction } from "../../types";
import { formatDate, getISTTime } from "../../lib/utils";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export function ProgressChart({ days: daysCount = 30 }: { days?: number }) {
  const { user } = useAuth();
  const { todayLog, currentDate } = useStats(); // Triggers re-render on today's updates
  const [historicalData, setHistoricalData] = useState<{ logs: DailyLog[], transactions: Transaction[] }>({ logs: [], transactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = statsService.subscribeToHistoricalData(user.uid, (data) => {
      setHistoricalData(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const chartData = useMemo(() => {
    const { logs, transactions } = historicalData;
    const today = currentDate;
    const days = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = getISTTime();
      d.setDate(d.getDate() - i);
      days.push(formatDate(d));
    }

    return days.map(date => {
      // Use todayLog for today's data point to ensure absolute real-time updates
      const isToday = date === today;
      const log = isToday ? (todayLog || logs.find(l => l.date === date)) : logs.find(l => l.date === date);
      const dayTrans = transactions.filter(t => t.createdAt.startsWith(date));
      
      const studyHours = log ? log.studyHours : 0;
      const penalties = dayTrans.reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return {
        date: date.split("-").slice(2).join("/"), // DD only for 30 days or just MM/DD
        fullDate: date.split("-").slice(1).join("/"),
        studyHours,
        penalties
      };
    });
  }, [historicalData, todayLog, currentDate, daysCount]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center glass-card">
        <div className="animate-pulse text-slate-600 uppercase tracking-widest text-[10px] font-black">Synchronizing Analytics...</div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 glass-card shadow-2xl space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/5 text-amber-500/60 border border-amber-500/10">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight font-cursive">Study Progress</h2>
            <p className="text-xs text-slate-500 italic font-light italic">Hours vs Penalties ({daysCount} Days)</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/10">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60 animate-pulse" />
          <span className="text-[9px] font-black text-amber-500/60 uppercase tracking-[0.2em]">Sanctum Live</span>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#475569" 
              fontSize={9}
              tickLine={false}
              axisLine={false}
              interval={daysCount > 10 ? 4 : 0}
              className="font-mono font-black"
            />
            <YAxis 
              stroke="#475569" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              className="font-mono font-black"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "rgba(15, 23, 42, 0.9)", 
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: "16px",
                fontSize: "10px",
                backdropFilter: "blur(8px)"
              }}
              itemStyle={{ fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.05em" }}
            />
            <Legend 
              verticalAlign="top" 
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: "20px", fontSize: "10px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.1em" }}
            />
            <Line 
              type="monotone" 
              dataKey="studyHours" 
              name="Focus Hours"
              stroke="#f59e0b" 
              strokeWidth={3}
              dot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0, fill: "#fbbf24" }}
              animationDuration={1500}
              isAnimationActive={true}
            />
            <Line 
              type="monotone" 
              dataKey="penalties" 
              name="Penalties"
              stroke="#f43f5e" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: "#f43f5e", strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              animationDuration={1500}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
