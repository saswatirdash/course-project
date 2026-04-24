import React from "react";
import { REWARDS, SHOP, PUNISHMENTS } from "../../constants";
import { coreService } from "../../services/coreService";
import { TransactionType } from "../../types";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

import { useStats } from "../../hooks/useStats";

export function ActionGrids() {
  const { userStats, todayLog } = useStats();
  const isCompleted = todayLog?.isCompleted;

  const handleAction = async (item: any, type: TransactionType) => {
    if (isCompleted) {
      toast.error("Day is complete! No more actions allowed.");
      return;
    }
    try {
      // Pre-check for shop items
      if (type === TransactionType.SHOP && userStats && userStats.balance + item.xp < 0) {
        toast.error("Insufficient XP Balance!");
        return;
      }
      await coreService.processManualTransaction(type, item.xp, item.label);
      toast.success(`${item.label} logged! ${item.xp > 0 ? "+" : ""}${item.xp} XP`);
    } catch (error: any) {
      toast.error(error.message || "Action failed");
    }
  };

  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500",
      isCompleted && "opacity-50 grayscale pointer-events-none"
    )}>
      {/* Rewards */}
      <div className="space-y-4">
        <div className="px-2">
          <h4 className="inline-flex px-3 py-1 bg-amber-500/80 text-black rounded-full text-[10px] font-black uppercase tracking-[0.2em] font-mono shadow-[0_0_15px_rgba(245,158,11,0.2)]">Rewards</h4>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {REWARDS.slice(0, 6).map((item, i) => (
            <motion.button
              key={i}
              whileHover={!isCompleted ? { x: 4 } : {}}
              onClick={() => handleAction(item, TransactionType.REWARD)}
              disabled={isCompleted}
              className="flex items-center justify-between p-3 glass-card hover:border-emerald-500/30 group transition-all w-full text-left relative overflow-hidden"
            >
              <div className="absolute inset-0 noise-overlay pointer-events-none opacity-[0.02]" />
              <div className="flex items-center gap-3 flex-1 min-w-0 relative z-10">
                <span className="text-lg grayscale group-hover:grayscale-0 transition-all flex-shrink-0">{item.icon}</span>
                <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-wider leading-relaxed py-0.5">{item.label}</span>
              </div>
              <span className="text-[10px] font-black text-emerald-500/60 font-mono flex-shrink-0 ml-3">+{item.xp}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Shop */}
      <div className="space-y-4">
        <div className="px-2">
          <h4 className="inline-flex px-3 py-1 bg-amber-500/80 text-black rounded-full text-[10px] font-black uppercase tracking-[0.2em] font-mono shadow-[0_0_15px_rgba(245,158,11,0.2)]">Shop</h4>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {SHOP.map((item, i) => {
            const canAfford = userStats ? userStats.balance + item.xp >= 0 : true;
            const isDisabled = !canAfford || isCompleted;
            return (
              <motion.button
                key={i}
                whileHover={!isDisabled ? { x: 4 } : {}}
                onClick={() => handleAction(item, TransactionType.SHOP)}
                disabled={isDisabled}
                className={cn(
                  "flex items-center justify-between p-3 glass-card group transition-all w-full text-left relative overflow-hidden",
                  !isDisabled 
                    ? "hover:border-amber-500/30" 
                    : "opacity-40 cursor-not-allowed grayscale"
                )}
              >
                <div className="absolute inset-0 noise-overlay pointer-events-none opacity-[0.02]" />
                <div className="flex items-center gap-3 flex-1 min-w-0 relative z-10">
                  <span className="text-lg grayscale group-hover:grayscale-0 transition-all flex-shrink-0">{item.icon}</span>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-wider leading-tight">{item.label}</span>
                    {!canAfford && !isCompleted && <span className="text-[8px] text-red-500/60 font-black uppercase tracking-tighter mt-1 font-mono">Insufficient Balance</span>}
                  </div>
                </div>
                <span className="text-[10px] font-black text-amber-500/60 font-mono flex-shrink-0 ml-3">{item.xp}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Punishments */}
      <div className="space-y-4">
        <div className="px-2">
          <h4 className="inline-flex px-3 py-1 bg-red-500/80 text-black rounded-full text-[10px] font-black uppercase tracking-[0.2em] font-mono shadow-[0_0_15px_rgba(239,68,68,0.2)]">Penalties</h4>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {PUNISHMENTS.map((item, i) => (
            <motion.button
              key={i}
              whileHover={!isCompleted ? { x: 4 } : {}}
              onClick={() => handleAction(item, TransactionType.PUNISHMENT)}
              disabled={isCompleted}
              className="flex items-center justify-between p-3 glass-card hover:border-red-500/30 group transition-all w-full text-left relative overflow-hidden"
            >
              <div className="absolute inset-0 noise-overlay pointer-events-none opacity-[0.02]" />
              <div className="flex items-center gap-3 flex-1 min-w-0 relative z-10">
                <span className="text-lg grayscale group-hover:grayscale-0 transition-all flex-shrink-0">{item.icon}</span>
                <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-wider leading-relaxed py-0.5">{item.label}</span>
              </div>
              <span className="text-[10px] font-black text-red-500/60 font-mono flex-shrink-0 ml-3">{item.xp}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
