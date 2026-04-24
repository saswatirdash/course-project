import React, { useState, useRef } from "react";
import { Target, Plus, CheckCircle2, Clock, Search, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { coreService } from "../../services/coreService";
import { useStats } from "../../hooks/useStats";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

export function DailyTargetCard() {
  const { todayLog } = useStats();
  const [target, setTarget] = useState(todayLog?.targetHours || 4);
  const [isSetting, setIsSetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingTarget, setIsEditingTarget] = useState(false);

  const handleSetTarget = async () => {
    setIsSetting(true);
    try {
      await coreService.setDailyTarget(target);
      toast.success("Daily target updated!");
      setIsEditingTarget(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to set target");
    } finally {
      setIsSetting(false);
    }
  };

  const handleResourceSearch = () => {
    // Trigger the hidden file input
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a custom event to notify AiBuddyBubble
      const event = new CustomEvent('aiBuddyAnalyzeFile', { detail: { file } });
      window.dispatchEvent(event);
      toast.info(`Sending ${file.name} to AI Buddy for analysis...`);
    }
  };

  const progress = todayLog ? Math.min(100, (todayLog.studyHours / todayLog.targetHours) * 100) : 0;

  return (
    <div className={cn(
      "glass-card p-6 shadow-2xl space-y-6 transition-all duration-500 bento-inner-shadow relative overflow-hidden",
      todayLog?.isCompleted && "opacity-50 grayscale pointer-events-none"
    )}>
      {/* Noise Texture */}
      <div className="absolute inset-0 noise-overlay pointer-events-none opacity-[0.03]" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleResourceSearch}
            title="Upload study material for AI analysis"
            className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all group"
          >
            <Target className="w-5 h-5 text-amber-500/60 group-hover:scale-110 transition-transform" />
          </button>
          <div>
            <h3 className="text-sm font-bold text-slate-200">Daily Goal</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Target</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          {todayLog?.isTargetMet && (
            <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-500/5 px-2 py-1 rounded-full border border-emerald-500/10">
              <CheckCircle2 className="w-3 h-3" />
              Met
            </div>
          )}
        </div>
      </div>

      {(!todayLog || todayLog.studyHours === 0 || isEditingTarget) ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-100 font-mono tracking-tighter">{target} <span className="text-sm font-light text-slate-500">Hours</span></span>
            <div className="flex gap-2">
              <button 
                onClick={() => setTarget(Math.max(1, target - 1))}
                className="w-8 h-8 rounded-lg bg-black/40 border border-white/5 text-slate-500 hover:text-slate-200 flex items-center justify-center transition-all"
              >
                -
              </button>
              <button 
                onClick={() => setTarget(Math.min(16, target + 1))}
                className="w-8 h-8 rounded-lg bg-black/40 border border-white/5 text-slate-500 hover:text-slate-200 flex items-center justify-center transition-all"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditingTarget && (
              <button 
                onClick={() => setIsEditingTarget(false)}
                className="flex-1 py-3 rounded-xl bg-black/40 border border-white/5 text-slate-500 font-bold text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
            )}
            <button 
              onClick={handleSetTarget}
              disabled={isSetting || todayLog?.isCompleted}
              className="flex-[2] py-3 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-500/20 font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:bg-amber-500 hover:text-black transition-all disabled:opacity-50"
            >
              {isSetting ? "LOADING..." : todayLog?.isCompleted ? "FINISHED" : isEditingTarget ? "UPDATE" : "START"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-slate-100 font-mono tracking-tighter leading-none">{todayLog.studyHours}h</span>
              <div className="flex items-center gap-1.5 pb-0.5">
                <span className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">/ {todayLog.targetHours}h goal</span>
                <button 
                  onClick={() => {
                    if (todayLog.isCompleted) return;
                    setTarget(todayLog.targetHours);
                    setIsEditingTarget(true);
                  }}
                  disabled={todayLog.isCompleted}
                  className={cn(
                    "text-[9px] font-black uppercase tracking-widest transition-all px-1.5 py-0.5 rounded-md bg-amber-500/5 border border-amber-500/10",
                    todayLog.isCompleted ? "text-slate-800 cursor-not-allowed opacity-50" : "text-amber-500/60 hover:text-amber-500 hover:bg-amber-500/10 active:scale-95 text-center"
                  )}
                >
                  Edit
                </button>
              </div>
            </div>
              {!todayLog.isTargetMet ? (
                <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.15em]">
                  {Math.max(0, todayLog.targetHours - todayLog.studyHours).toFixed(1)}h left
                </p>
              ) : (
                <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.15em]">Goal achieved</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Progress</p>
              <p className="text-sm font-black text-amber-500/60 font-mono">{Math.round(progress)}%</p>
            </div>
          </div>
          <div className="h-1.5 bg-black/40 rounded-full border border-white/5 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn(
                "h-full transition-colors duration-500 shadow-[0_0_12px]",
                progress >= 100 ? "bg-emerald-500 shadow-emerald-500/20" : "bg-amber-500 shadow-amber-500/20"
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
