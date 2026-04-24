import React from "react";
import { useStats } from "../../hooks/useStats";
import { formatXP, cn } from "../../lib/utils";
import { TransactionType } from "../../types";
import { ArrowUpRight, ArrowDownRight, Zap, Trophy, ShoppingCart, AlertTriangle, GraduationCap, Briefcase } from "lucide-react";

export function RecentActivity() {
  const { recentTransactions } = useStats();

  const getIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.STUDY: return <Zap className="w-4 h-4 text-amber-500/60" />;
      case TransactionType.REWARD: return <Trophy className="w-4 h-4 text-emerald-500/60" />;
      case TransactionType.SHOP: return <ShoppingCart className="w-4 h-4 text-purple-400/60" />;
      case TransactionType.PUNISHMENT: return <AlertTriangle className="w-4 h-4 text-red-400/60" />;
      case TransactionType.MASTERY: return <Zap className="w-4 h-4 text-amber-300/80" />;
      case TransactionType.CERTIFICATION: return <GraduationCap className="w-4 h-4 text-emerald-400/60" />;
      case TransactionType.INTERNSHIP: return <Briefcase className="w-4 h-4 text-amber-500/60" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="glass-card overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
        <h4 className="inline-flex px-2 py-0.5 bg-amber-500/80 text-black rounded text-[9px] font-black uppercase tracking-[0.2em] font-mono">Activity Stream</h4>
        <span className="text-[10px] font-bold text-amber-500/60 font-cursive text-sm">Mindful flow active</span>
      </div>

      <div className="divide-y divide-white/5">
        {recentTransactions.map((tx) => {
          const { label, colorClass } = formatXP(tx.amount);
          return (
            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-black/20 border border-white/5 flex items-center justify-center">
                  {getIcon(tx.type)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-300 font-sans tracking-tight">{tx.description}</p>
                  <p className="inline-flex px-1.5 py-0.5 bg-amber-500/10 text-black text-[8px] font-black uppercase tracking-widest font-mono rounded mt-1">
                    {tx.type} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className={cn("text-xs font-black font-mono tracking-tighter", colorClass)}>
                {label}
              </div>
            </div>
          );
        })}

        {recentTransactions.length === 0 && (
          <div className="p-12 text-center">
            <p className="inline-flex px-2 py-1 bg-amber-500/10 text-black text-[9px] font-black uppercase tracking-widest italic rounded font-mono">The stream is quiet...</p>
          </div>
        )}
      </div>
    </div>
  );
}
