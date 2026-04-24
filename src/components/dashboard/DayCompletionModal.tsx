import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ShoppingBag, AlertTriangle, Moon, ChevronRight, Loader2 } from "lucide-react";
import { REWARDS, SHOP, PUNISHMENTS } from "../../constants";
import { TransactionType } from "../../types";
import { coreService } from "../../services/coreService";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

import { useStats } from "../../hooks/useStats";

interface DayCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

enum Step {
  WARNING = "WARNING",
  REWARDS = "REWARDS",
  SHOP = "SHOP",
  PENALTIES = "PENALTIES",
  SUCCESS = "SUCCESS"
}

export function DayCompletionModal({ isOpen, onClose, onComplete }: DayCompletionModalProps) {
  const { userStats } = useStats();
  const [step, setStep] = useState<Step>(Step.WARNING);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>("skip");

  const handleNext = async () => {
    setIsProcessing(true);
    try {
      if (step === Step.WARNING) {
        setStep(Step.REWARDS);
      } else if (step === Step.REWARDS) {
        if (selectedItem !== "skip") {
          const item = REWARDS.find(r => r.label === selectedItem);
          if (item) {
            await coreService.processManualTransaction(TransactionType.REWARD, item.xp, `Reward: ${item.label}`);
          }
        }
        setSelectedItem("skip");
        setStep(Step.SHOP);
      } else if (step === Step.SHOP) {
        if (selectedItem !== "skip") {
          const item = SHOP.find(s => s.label === selectedItem);
          if (item) {
            // Double check balance before calling service
            if (userStats && userStats.balance + item.xp < 0) {
              throw new Error("Insufficient XP Balance for this item");
            }
            await coreService.processManualTransaction(TransactionType.SHOP, item.xp, `Shop: ${item.label}`);
          }
        }
        setSelectedItem("skip");
        setStep(Step.PENALTIES);
      } else if (step === Step.PENALTIES) {
        if (selectedItem !== "skip") {
          const item = PUNISHMENTS.find(p => p.label === selectedItem);
          if (item) {
            await coreService.processManualTransaction(TransactionType.PUNISHMENT, item.xp, `Penalty: ${item.label}`);
          }
        }
        await coreService.markDayAsComplete();
        setStep(Step.SUCCESS);
      } else if (step === Step.SUCCESS) {
        onComplete();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case Step.WARNING:
        return (
          <div className="space-y-6 text-center py-4">
            <div className="w-20 h-20 bg-amber-500/5 rounded-full flex items-center justify-center mx-auto border border-amber-500/10">
              <AlertTriangle className="w-10 h-10 text-amber-500/60" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-100 font-cursive uppercase tracking-widest">Final Reality Check</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-light italic">
                Marking the day as complete will lock your logs. Are you certain your academic ritual is finished for this cycle?
              </p>
            </div>
          </div>
        );
      case Step.REWARDS:
        return (
          <div className="space-y-6 py-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="p-3 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                <Sparkles className="w-6 h-6 text-amber-500/60" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-100 font-cursive uppercase tracking-wider">Unclaimed Bounty?</h3>
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest font-mono">Select any extra achievements earned</p>
              </div>
            </div>
            <div className="space-y-3">
              <select 
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500/20 appearance-none cursor-pointer transition-all"
              >
                <option value="skip" className="bg-[#050508]">Skip Bounty Phase</option>
                {REWARDS.map((item) => (
                  <option key={item.label} value={item.label} className="bg-[#050508]">
                    {item.label} (+{item.xp} XP)
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      case Step.SHOP:
        return (
          <div className="space-y-6 py-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="p-3 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                <ShoppingBag className="w-6 h-6 text-amber-500/60" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-100 font-cursive uppercase tracking-wider">The Arctisan Market</h3>
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest font-mono">Exchange your XP for sanctuary boons</p>
              </div>
            </div>
            <div className="space-y-3">
              <select 
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500/20 appearance-none cursor-pointer transition-all"
              >
                <option value="skip" className="bg-[#050508]">Skip Exchange</option>
                {SHOP.map((item) => {
                  const canAfford = userStats ? userStats.balance + item.xp >= 0 : true;
                  return (
                    <option key={item.label} value={item.label} disabled={!canAfford} className="bg-[#050508]">
                      {item.label} ({item.xp} XP) {!canAfford && "(Lacking Essence)"}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        );
      case Step.PENALTIES:
        return (
          <div className="space-y-6 py-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="p-3 bg-red-500/5 rounded-2xl border border-red-500/10">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-100 font-cursive uppercase tracking-wider">Confessional</h3>
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest font-mono italic leading-tight">Be honest, for God is watching</p>
              </div>
            </div>
            <div className="space-y-3">
              <select 
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-red-500/20 appearance-none cursor-pointer transition-all"
              >
                <option value="skip" className="bg-[#050508]">A Pure Day (No Penalties)</option>
                {PUNISHMENTS.map((item) => (
                  <option key={item.label} value={item.label} className="bg-[#050508]">
                    {item.label} ({item.xp} XP)
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      case Step.SUCCESS:
        return (
          <div className="space-y-6 text-center py-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 bg-emerald-500/5 rounded-full flex items-center justify-center mx-auto border border-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.05)]"
            >
              <Moon className="w-12 h-12 text-emerald-500/40" />
            </motion.div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-100 font-cursive uppercase tracking-widest">Ritual Sealed</h3>
              <p className="text-slate-600 text-sm font-light italic leading-relaxed">May your rest be as productive as your focus. The day is yours.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass-card p-8 shadow-2xl overflow-hidden"
          >
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-black/40">
              <motion.div 
                className="h-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                initial={{ width: "0%" }}
                animate={{ 
                  width: step === Step.WARNING ? "20%" : 
                         step === Step.REWARDS ? "40%" : 
                         step === Step.SHOP ? "60%" : 
                         step === Step.PENALTIES ? "80%" : "100%" 
                }}
              />
            </div>

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/5 text-slate-700 hover:text-slate-400 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mt-4">
              {renderContent()}
            </div>

            <div className="mt-8 flex gap-3">
              {step !== Step.SUCCESS && (
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl bg-black/40 border border-white/5 text-slate-600 font-black text-xs uppercase tracking-widest font-mono transition-all hover:text-slate-400"
                >
                  Withdraw
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={isProcessing}
                className={cn(
                  "flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest font-mono transition-all flex items-center justify-center gap-2",
                  step === Step.SUCCESS 
                  ? "bg-emerald-500/20 text-emerald-100 border border-emerald-500/20" 
                  : "bg-amber-500/20 text-amber-100 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:bg-amber-500 hover:text-black"
                )}
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {step === Step.SUCCESS ? "Seal Ritual" : "Proceed"}
                    {step !== Step.SUCCESS && <ChevronRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
