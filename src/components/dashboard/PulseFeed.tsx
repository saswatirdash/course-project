import React from "react";
import { useNotifications } from "../../hooks/useNotifications";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, GraduationCap, Zap, Timer, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";

export function PulseFeed() {
  const { notifications } = useNotifications();

  const getIcon = (type?: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
      case 'warning': return <Zap className="w-3 h-3 text-amber-500" />;
      case 'error': return <Zap className="w-3 h-3 text-rose-500" />;
      default: return <Sparkles className="w-3 h-3 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono">Academic Pulse</h4>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">Live Sync</span>
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
        <AnimatePresence mode="popLayout">
          {notifications.length > 0 ? (
            notifications.map((n, i) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={cn(
                  "p-4 rounded-2xl border transition-all duration-500 group relative overflow-hidden",
                  n.read ? "bg-white/5 border-white/5" : "bg-white/[0.07] border-white/10 shadow-lg"
                )}
              >
                {!n.read && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500/40" />}
                
                <div className="flex gap-3 items-start">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-slate-400 group-hover:text-amber-500 transition-colors">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-black text-slate-200 truncate uppercase tracking-tight">{n.title}</p>
                      <span className="text-[8px] font-black text-slate-600 uppercase font-mono whitespace-nowrap">{n.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-light italic truncate">{n.message}</p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-8 text-center border border-dashed border-white/5 rounded-2xl opacity-30">
              <p className="text-[9px] font-black uppercase tracking-widest">No pulse detected</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
