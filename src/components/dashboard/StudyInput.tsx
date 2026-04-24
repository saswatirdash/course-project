import React, { useState } from "react";
import { BookOpen, Plus, Minus, Send, Loader2, Moon } from "lucide-react";
import { coreService } from "../../services/coreService";
import { useStats } from "../../hooks/useStats";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

import { useNotifications } from "../../hooks/useNotifications";

export function StudyInput() {
  const { todayLog } = useStats();
  const { addNotification } = useNotifications();
  const [sessionHours, setSessionHours] = useState(1.0);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAddSession = async () => {
    if (!todayLog) {
      toast.error("Set a daily target first!");
      return;
    }
    if (sessionHours <= 0) {
      toast.error("Enter a valid session duration");
      return;
    }

    setIsUpdating(true);
    try {
      const currentTotal = todayLog.studyHours || 0;
      const newTotal = currentTotal + sessionHours;
      
      await coreService.logStudyHours(newTotal);
      toast.success(`Logged ${sessionHours}h session! Total: ${newTotal}h`);
      
      addNotification(
        "Study Session Logged", 
        `You added ${sessionHours} hours to your academic record. Keep it up!`,
        'success'
      );
      
      setSessionHours(1.0); // Reset session input
    } catch (error: any) {
      toast.error(error.message || "Failed to log session");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={cn(
      "glass-card p-6 shadow-2xl space-y-6 transition-all duration-500",
      todayLog?.isCompleted && "opacity-50 grayscale pointer-events-none"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <BookOpen className="w-5 h-5 text-amber-500/60" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">Log Study</h3>
            <p className="inline-flex px-1.5 py-0.5 bg-amber-500/40 text-black text-[9px] font-black uppercase tracking-widest font-mono rounded">Add Time</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-black bg-amber-500/20 px-1.5 py-0.5 rounded uppercase tracking-widest font-mono">Today</p>
          <p className="text-sm font-black text-amber-500/60 font-mono mt-1">{todayLog?.studyHours || 0}h</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
          <button 
            onClick={() => setSessionHours(Math.max(0.5, sessionHours - 0.5))}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-500 transition-colors"
          >
            <Minus className="w-5 h-5" />
          </button>
          
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-100 font-mono tracking-tighter">{sessionHours}</span>
            <span className="text-[9px] font-black text-black bg-amber-500/10 px-1 rounded uppercase tracking-widest font-mono">hr</span>
          </div>

          <button 
            onClick={() => setSessionHours(Math.min(8, sessionHours + 0.5))}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-500 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <button 
          onClick={handleAddSession}
          disabled={isUpdating || !todayLog || todayLog.isCompleted}
          className="w-full py-4 rounded-2xl bg-amber-500/20 text-amber-200 border border-amber-500/20 font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:bg-amber-500 hover:text-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : todayLog?.isCompleted ? <Moon className="w-5 h-5" /> : <Send className="w-4 h-4 ml-1" />}
          {isUpdating ? "SAVING..." : todayLog?.isCompleted ? "FINISHED" : `ADD ${sessionHours}H`}
        </button>
      </div>
    </div>
  );
}
