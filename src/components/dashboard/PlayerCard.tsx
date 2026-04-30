import React from "react";
import { 
  Trophy, 
  Target, 
  Zap, 
  TrendingUp, 
  Clock, 
  Calendar,
  ChevronRight,
  Plus,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useStats } from "../../hooks/useStats";
import { useBacklogs } from "../../hooks/useSemester";
import { calculateLevel, getXpProgressPercent, calculateRank } from "../../lib/stats";
import { cn } from "../../lib/utils";
import { Rank } from "../../types";

export function PlayerCard() {
  const { userStats } = useStats();
  const { backlogs } = useBacklogs();

  if (!userStats) return null;
  
  const level = calculateLevel(userStats.lifetimeXp || 0);
  const progress = getXpProgressPercent(userStats.lifetimeXp || 0);
  const rank = calculateRank(userStats.lifetimeXp || 0);
  
  const rankColors: Record<Rank, string> = {
    BEGINNER: "border-gray-500 text-gray-400",
    GRINDER: "border-amber-500/50 text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]",
    ELITE: "border-purple-500 text-purple-400 shadow-[0_0_8px_#8B5CF6]",
    LEGEND: "border-yellow-500 text-yellow-400 shadow-[0_0_12px_#EAB308]",
    UNSTOPPABLE: "border-red-500 text-red-400 shadow-[0_0_12px_#EF4444] animate-pulse",
  };
  
  return (
    <div className="glass-card p-6 shadow-2xl relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/5 blur-[60px] rounded-full group-hover:bg-amber-500/10 transition-all duration-500" />
      
      <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 text-center sm:text-left">
        {/* Avatar / Level Ring */}
        <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle cx="48" cy="48" r="44" fill="transparent" stroke="#0F172A" strokeWidth="6" className="opacity-50" />
            <motion.circle
              cx="48"
              cy="48"
              r="44"
              fill="transparent"
              stroke="rgb(245, 158, 11)"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 44}
              initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 44 - (progress / 100) * (2 * Math.PI * 44) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            />
          </svg>
          <div className="absolute w-18 h-18 rounded-full bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden">
            {userStats.image ? (
              <img src={userStats.image} alt={userStats.name} className="w-full h-full object-cover grayscale-[0.2]" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-2xl font-black text-amber-500/60">{userStats.name.substring(0, 1).toUpperCase()}</span>
            )}
          </div>
          <div className="absolute -bottom-1 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.4)] uppercase">
            Lv.{level}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-slate-100 tracking-tight font-cursive">{userStats.name}</h2>
            <span className={cn(
              "text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest",
              rankColors[rank]
            )}>
              {rank}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/5 rounded-full border border-amber-500/10">
              <Zap className="w-3.5 h-3.5 text-amber-500/60" />
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{userStats.streak} Days</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/5 rounded-full border border-purple-500/10">
              <Trophy className="w-3.5 h-3.5 text-purple-500/60" />
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{userStats.lifetimeXp} XP</span>
            </div>
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full border",
              (userStats.balance || 0) < 0 
                ? "bg-red-500/5 border-red-500/10" 
                : "bg-emerald-500/5 border-emerald-500/10"
            )}>
              <Plus className={cn("w-3.5 h-3.5", (userStats.balance || 0) < 0 ? "text-red-500/60" : "text-emerald-500/60")} />
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                (userStats.balance || 0) < 0 ? "text-red-400/80" : "text-emerald-400/80"
              )}>
                {userStats.balance} Bal
              </span>
            </div>

            {backlogs.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/5 border border-red-500/10 rounded-full animate-pulse-slow">
                <AlertCircle className="w-3.5 h-3.5 text-red-500/60" />
                <span className="text-red-400/80 text-[10px] font-black uppercase tracking-widest">{backlogs.length} Backlogs</span>
              </div>
            )}
          </div>

          {/* XP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">Progress to Lv.{level + 1}</span>
              <span className="text-amber-500/60">{progress}%</span>
            </div>
            <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
