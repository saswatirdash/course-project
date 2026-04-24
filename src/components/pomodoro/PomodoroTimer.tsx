import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain, Zap, Sparkles, X, Layout } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { coreService } from "../../services/coreService";
import { TransactionType } from "../../types";
import { useStats } from "../../hooks/useStats";

type Mode = "study" | "short" | "long";

import { useNotifications } from "../../hooks/useNotifications";

export function PomodoroTimer() {
  const { todayLog } = useStats();
  const { addNotification } = useNotifications();
  const [mode, setMode] = useState<Mode>("study");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const settings = {
    study: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      if (todayLog?.isCompleted) {
        setIsActive(false);
        toast.error("Day is already marked as complete. No more study sessions allowed.");
        return;
      }
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, todayLog?.isCompleted]);

  const handleComplete = async () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (mode === "study") {
      if (todayLog?.isCompleted) {
        toast.error("Day is already marked as complete. Progress not saved.");
        return;
      }
      setSessionsCompleted((prev) => prev + 1);
      toast.success("Focus Session Complete! +5 XP");
      addNotification(
        "Focus Session Complete",
        "You've completed 25 minutes of deep focus. Time for a breather!",
        'success'
      );
      try {
        await coreService.processManualTransaction(
          TransactionType.REWARD, 
          5, 
          "Completed Pomodoro Focus Session"
        );
      } catch (error) {
        console.error("XP Award Error:", error);
      }
      setMode("short");
      setTimeLeft(settings.short);
    } else {
      toast.info("Break over! Time to focus.");
      addNotification(
        "Break Ended",
        "Your recovery time is up. Ready to engage flow state?",
        'info'
      );
      setMode("study");
      setTimeLeft(settings.study);
    }
  };

  const toggleTimer = () => {
    if (todayLog?.isCompleted) {
      toast.error("Day is already marked as complete. No more study sessions allowed.");
      return;
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(settings[mode]);
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(settings[newMode]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progress = (timeLeft / settings[mode]) * 100;

  return (
    <div className="max-w-4xl mx-auto relative group">
      {/* Immersive Background Layer */}
      <div className="absolute inset-0 rounded-[40px] overflow-hidden z-0 border border-white/5 shadow-2xl">
        <video
          autoPlay
          loop
          muted
          playsInline
          className={cn(
            "w-full h-full object-cover transition-opacity duration-1000 grayscale-[0.4] opacity-40",
            isActive ? "opacity-60 grayscale-[0.2]" : "opacity-30"
          )}
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-girl-studying-by-the-window-in-a-rainy-day-2423-large.mp4" type="video/mp4" />
        </video>
        
        {/* Amber Desk Lamp Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[120px] -mr-32 -mt-32 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent" />
      </div>

      <div className="relative z-10 p-12 flex flex-col items-center gap-12 min-h-[500px] justify-center">
        {/* Mode Toggles */}
        <div className="flex gap-4 p-1 glass-card backdrop-blur-md rounded-2xl border border-white/5 relative z-10">
          {(["study", "short", "long"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={cn(
                "px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                mode === m ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]" : "text-slate-500/60 hover:text-slate-300"
              )}
            >
              {m === "study" ? "Focus" : m === "short" ? "Short Break" : "Long Break"}
            </button>
          ))}
        </div>

        {/* Minimalist Timer Display */}
        <div className="relative flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            {/* Ambient Progress Ring */}
            <svg className="absolute -inset-12 w-[calc(100%+96px)] h-[calc(100%+96px)] -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                className="stroke-white/5 fill-transparent"
                strokeWidth="2"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="45%"
                className="stroke-amber-500/20 fill-transparent"
                strokeWidth="2"
                strokeDasharray="100 100"
                animate={{ strokeDashoffset: 100 - progress }}
                transition={{ duration: 0.5, ease: "linear" }}
              />
            </svg>

            <motion.div 
              key={timeLeft}
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[140px] font-black text-slate-100 font-mono tracking-tighter opacity-90 drop-shadow-[0_0_25px_rgba(255,255,255,0.1)] leading-none"
            >
              {formatTime(timeLeft)}
            </motion.div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isActive ? "bg-amber-400 animate-pulse" : "bg-slate-600"
            )} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500/80">
              {isActive ? "Flow State Engaged" : "Session Paused"}
            </span>
          </div>
        </div>

        {/* Controls Layout */}
        <div className="flex flex-col items-center gap-8 w-full max-w-sm">
          <div className="flex items-center justify-center gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTimer}
              className="p-4 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTimer}
              className={cn(
                "w-24 h-24 rounded-[32px] flex items-center justify-center transition-all duration-500",
                isActive 
                  ? "bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.1)]" 
                  : "bg-amber-500 text-black shadow-[0_0_50px_rgba(245,158,11,0.3)] hover:shadow-[0_0_60px_rgba(245,158,11,0.4)]"
              )}
            >
              {isActive ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 fill-current" />}
            </motion.button>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 opacity-40 cursor-not-allowed">
              <Layout className="w-6 h-6 text-slate-500" />
            </div>
          </div>

          {/* Sessions Counter */}
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest pt-4 border-t border-white/5 w-full justify-center">
            <span className="text-white bg-white/5 px-2 py-0.5 rounded font-mono border border-white/5">Rituals Complete</span>
            <div className="h-[1px] w-8 bg-white/5" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <motion.div 
                  key={i}
                  initial={false}
                  animate={{ 
                    scale: i < sessionsCompleted ? 1.2 : 1,
                    backgroundColor: i < sessionsCompleted ? "rgba(245, 158, 11, 0.6)" : "rgba(255, 255, 255, 0.05)"
                  }}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full border border-white/10"
                  )} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
