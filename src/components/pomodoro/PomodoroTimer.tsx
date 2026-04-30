import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain, Zap, Sparkles, X, Settings, Check, Clock } from "lucide-react";
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
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [durations, setDurations] = useState(() => {
    const saved = localStorage.getItem("pomodoro_durations");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { study: 25, short: 5, long: 15 };
      }
    }
    return { study: 25, short: 5, long: 15 };
  });

  const [timeLeft, setTimeLeft] = useState(durations.study * 60);

  useEffect(() => {
    localStorage.setItem("pomodoro_durations", JSON.stringify(durations));
  }, [durations]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const settings = {
    study: durations.study * 60,
    short: durations.short * 60,
    long: durations.long * 60,
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
      
      if (durations.study > 0) {
        toast.success("Focus Session Complete! +5 XP");
        addNotification(
          "Focus Session Complete",
          `You've completed ${durations.study} minutes of deep focus. Time for a breather!`,
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
      } else {
        toast.info("Session skipped (0 min duration)");
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

  const progress = settings[mode] > 0 ? (timeLeft / settings[mode]) * 100 : 0;

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
        <div className="flex flex-col items-center gap-10 w-full max-w-sm relative">
          <div className="flex items-center justify-center gap-8 z-20">
            <motion.button
              whileHover={{ scale: 1.1, rotate: -15 }}
              whileTap={{ scale: 0.9 }}
              onClick={resetTimer}
              className="p-5 rounded-3xl bg-white/5 border border-white/10 text-slate-400 hover:text-amber-500 hover:bg-white/10 transition-all shadow-lg backdrop-blur-sm"
              title="Reset Timer"
            >
              <RotateCcw className="w-7 h-7" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTimer}
              className={cn(
                "w-28 h-28 rounded-[40px] flex items-center justify-center transition-all duration-500 shadow-2xl relative group/play",
                isActive 
                  ? "bg-amber-500/10 border-2 border-amber-500/30 text-amber-500" 
                  : "bg-amber-500 text-black border-2 border-amber-400"
              )}
            >
              {isActive && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-amber-500 rounded-full blur-2xl"
                />
              )}
              {isActive ? <Pause className="w-12 h-12 relative z-10" /> : <Play className="w-12 h-12 fill-current relative z-10 ml-1" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={cn(
                "p-5 rounded-3xl border transition-all shadow-lg backdrop-blur-sm",
                isSettingsOpen 
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-500" 
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
              )}
              title="Calibration"
            >
              <Settings className="w-7 h-7" />
            </motion.button>
          </div>

          <AnimatePresence>
            {isSettingsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.95 }}
                className="absolute inset-x-0 bottom-full mb-12 p-8 glass-card border border-amber-500/20 backdrop-blur-3xl z-40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[32px]"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-xl">
                      <Clock className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">Aura Calibration</h3>
                      <p className="text-[10px] text-slate-500 font-bold opacity-60">Fine-tune your focus rhythm</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-xl transition-colors group"
                  >
                    <X className="w-5 h-5 text-slate-500 group-hover:text-amber-500 transition-colors" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {(["study", "short", "long"] as const).map((m) => (
                    <div key={m} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            m === "study" ? "bg-amber-500" : m === "short" ? "bg-emerald-500" : "bg-blue-500"
                          )} />
                          {m === "study" ? "Focus" : m === "short" ? "Minor Rest" : "Major Rest"}
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-amber-500/80 font-mono">{durations[m]}</span>
                          <span className="text-[10px] font-bold text-slate-600 uppercase">Min</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {(m === "study" ? [15, 25, 45, 60] : m === "short" ? [3, 5, 10] : [15, 20, 30]).map(preset => (
                          <button
                            key={preset}
                            onClick={() => {
                              const newDurations = { ...durations, [m]: preset };
                              setDurations(newDurations);
                              if (mode === m && !isActive) {
                                setTimeLeft(preset * 60);
                              }
                            }}
                            className={cn(
                              "flex-1 py-3 rounded-xl text-xs font-black transition-all border",
                              durations[m] === preset 
                                ? "bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20" 
                                : "bg-white/5 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10"
                            )}
                          >
                            {preset}
                          </button>
                        ))}
                        <div className="relative flex-1">
                          <input
                            type="number"
                            value={durations[m]}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(180, parseInt(e.target.value) || 0));
                              const newDurations = { ...durations, [m]: val };
                              setDurations(newDurations);
                              if (mode === m && !isActive) {
                                setTimeLeft(val * 60);
                              }
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs font-black text-amber-500 placeholder:text-slate-700 focus:outline-none focus:border-amber-500/40 transition-all font-mono"
                            placeholder="Custom"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10">
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      toast.success("Focus rhythm calibrated");
                    }}
                    className="w-full py-4 rounded-3xl bg-white/5 border border-white/10 text-amber-500 font-black text-xs uppercase tracking-[0.3em] hover:bg-amber-500 hover:text-black hover:border-amber-400 transition-all shadow-xl group flex items-center justify-center gap-3"
                  >
                    <Check className="w-4 h-4 group-hover:scale-125 transition-transform" />
                    Apply Changes
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
