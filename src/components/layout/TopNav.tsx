import React, { useState } from "react";
import { Bell, Flame, Sparkles } from "lucide-react";
import { useStats } from "../../hooks/useStats";
import { calculateLevel, getXpProgressPercent } from "../../lib/stats";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

import { useNotifications } from "../../hooks/useNotifications";

export function TopNav({ activeTab, isCollapsed }: { activeTab: string; isCollapsed: boolean }) {
  const { userStats } = useStats();
  const { notifications, clearAll } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const tabTitles: Record<string, string> = {
    dashboard: "Command Center",
    syllabus: "Syllabus Tracker",
    focus: "Focus Zone",
    progress: "Progress Hub",
    history: "Transaction History",
    settings: "Settings",
  };

  const level = userStats ? calculateLevel(userStats.lifetimeXp) : 0;
  const progress = userStats ? getXpProgressPercent(userStats.lifetimeXp) : 0;
  const dashArray = 2 * Math.PI * 18; // radius 18
  const dashOffset = dashArray - (progress / 100) * dashArray;

  return (
    <header className={cn(
      "fixed top-0 right-0 left-0 h-20 pt-4 bg-[#050508]/80 backdrop-blur-2xl border-b border-white/5 z-30 flex items-center justify-between px-6 transition-all duration-300",
      isCollapsed ? "ml-0 lg:ml-16" : "ml-0 lg:ml-60"
    )}>
      <h1 className="text-xl font-black text-slate-100 font-cursive tracking-wider">
        {tabTitles[activeTab] || "Sanctuary"}
      </h1>

      <div className="flex items-center gap-4">
        {/* Streak */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/10 text-amber-500/60"
        >
          <Flame className="w-4 h-4 fill-current opacity-80" />
          <span className="text-xs font-black font-mono">{userStats?.streak || 0}</span>
        </motion.div>

        {/* XP Balance */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500",
          (userStats?.balance || 0) < 0 
            ? "bg-red-500/5 border-red-500/10 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.1)]"
            : "bg-amber-500/5 border-amber-500/10 text-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
        )}>
          <Sparkles className="w-4 h-4 opacity-60" />
          <span className="text-xs font-black font-mono tracking-tight">{userStats?.balance || 0} XP</span>
        </div>

        {/* Level Ring */}
        <div className="relative w-10 h-10 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="transparent"
              stroke="rgba(255,255,255,0.02)"
              strokeWidth="2.5"
            />
            <motion.circle
              cx="20"
              cy="20"
              r="18"
              fill="transparent"
              stroke="rgba(245, 158, 11, 0.4)"
              strokeWidth="2.5"
              strokeDasharray={dashArray}
              initial={{ strokeDashoffset: dashArray }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-[8px] font-black text-amber-500/60 font-mono">Lv.{level}</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={cn(
              "p-2 rounded-xl transition-all relative group",
              isNotificationsOpen ? "bg-amber-500/10 text-amber-500" : "text-slate-700 hover:bg-white/5 hover:text-amber-500/60"
            )}
          >
            <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            {notifications.some(n => !n.read) && (
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] border border-[#050508]" />
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsNotificationsOpen(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 min-h-[300px] bg-[#0A0A0F] border border-white/20 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono">Sanctuary Alerts</h3>
                    <button 
                      onClick={clearAll}
                      className="text-[9px] font-bold text-amber-500/40 hover:text-amber-500 transition-colors uppercase tracking-widest"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={cn(
                            "p-4 border-b border-white/10 hover:bg-white/[0.05] transition-colors cursor-default group relative overflow-hidden",
                            !n.read && "bg-amber-500/[0.05]"
                          )}
                        >
                          {!n.read && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500/40" />}
                          <div className="flex gap-3 items-start">
                            <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-amber-500/60">
                              <Sparkles className="w-3 h-3" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-slate-200 leading-tight">{n.title}</p>
                              <p className="text-[10px] text-slate-500 leading-relaxed italic">{n.message}</p>
                              <p className="text-[8px] font-black font-mono text-slate-700 uppercase">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-20 text-center space-y-3 opacity-20">
                        <Bell className="w-8 h-8 mx-auto text-slate-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Sanctuary is silent</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
