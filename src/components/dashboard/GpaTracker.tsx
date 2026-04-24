import React, { useState } from "react";
import { Calculator, Plus, RefreshCw, Trash2, Sparkles, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const getGpaFeedback = (cgpa: number) => {
  if (cgpa >= 9.5) return { 
    color: "text-yellow-400", 
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
    label: "Exceptional", 
    emoji: "⚡",
    message: "Rare score, rarer mindset. Whatever you've been doing — don't change it." 
  };
  if (cgpa >= 9.0) return { 
    color: "text-purple-400", 
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
    label: "High Achiever", 
    emoji: "🟣",
    message: "You've put in serious work to get here. The opportunities ahead reflect that." 
  };
  if (cgpa >= 8.0) return { 
    color: "text-amber-500", 
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    label: "Soul of Sanctuary", 
    emoji: "🔥",
    message: "Your focus is becoming a superpower. The momentum is undeniable." 
  };
  if (cgpa >= 7.0) return { 
    color: "text-emerald-400", 
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    label: "Flow State", 
    emoji: "🍃",
    message: "You're finding your rhythm. Consistency in the sanctuary leads to mastery." 
  };
  if (cgpa >= 6.0) return { 
    color: "text-yellow-200", 
    bg: "bg-yellow-200/10",
    border: "border-yellow-200/20",
    label: "Building Momentum", 
    emoji: "🟡",
    message: "Solid foundation. A bit more consistency and you'll surprise yourself." 
  };
  if (cgpa >= 5.0) return { 
    color: "text-orange-400", 
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    label: "Room to Grow", 
    emoji: "🟠",
    message: "You're showing up. Now let's make it count a little more each day." 
  };
  return { 
    color: "text-red-400", 
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    label: "Needs Attention", 
    emoji: "🔴",
    message: "Every topper has a semester they don't talk about. Make this your turning point." 
  };
};

export function GpaTracker() {
  const [sgpas, setSgpas] = useState<string[]>(["", ""]);
  const [cgpa, setCgpa] = useState<number | null>(null);

  const handleAddSemester = () => {
    if (sgpas.length < 8) {
      setSgpas([...sgpas, ""]);
    }
  };

  const handleRemoveSemester = (index: number) => {
    if (sgpas.length > 1) {
      const newSgpas = sgpas.filter((_, i) => i !== index);
      setSgpas(newSgpas);
    }
  };

  const handleSgpaChange = (index: number, value: string) => {
    const newSgpas = [...sgpas];
    newSgpas[index] = value;
    setSgpas(newSgpas);
  };

  const calculateCgpa = () => {
    const validSgpas = sgpas
      .map(s => parseFloat(s))
      .filter(s => !isNaN(s) && s >= 0 && s <= 10);
    
    if (validSgpas.length === 0) {
      setCgpa(0);
      return;
    }

    const sum = validSgpas.reduce((a, b) => a + b, 0);
    const result = sum / validSgpas.length;
    const finalCgpa = Number(result.toFixed(2));
    setCgpa(finalCgpa);

    if (finalCgpa >= 7.0) {
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        colors: ['#9d4edd', '#a5f3fc', '#fda4af', '#ffffff'],
      };

      function fire(particleRatio: number, opts: any) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }
  };

  const reset = () => {
    setSgpas(["", ""]);
    setCgpa(null);
  };

  return (
    <div className="p-8 glass-card shadow-2xl space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-amber-500/5 text-amber-500/60 border border-amber-500/10">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight font-cursive">Performance Index</h2>
          <p className="text-xs text-slate-500 italic font-light italic">Calculate your cumulative academic weight</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {sgpas.map((sgpa, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative group"
            >
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 block pl-1 font-mono">
                Sem {index + 1}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={sgpa}
                  onChange={(e) => handleSgpaChange(index, e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black/40 border border-white/5 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-300 font-mono outline-none focus:border-amber-500/30 transition-all placeholder:text-slate-800"
                />
                {sgpas.length > 1 && (
                  <button
                    onClick={() => handleRemoveSemester(index)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-500/5 opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove Semester"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {sgpas.length < 8 && (
          <button
            onClick={handleAddSemester}
            className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl p-4 bg-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group"
          >
            <Plus className="w-5 h-5 text-slate-700 group-hover:text-amber-500/60 mb-1" />
            <span className="text-[10px] font-black text-slate-700 group-hover:text-amber-500/60 uppercase tracking-widest font-mono">Add Sem</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/5">
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={calculateCgpa}
            className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-amber-500/20 border border-amber-500/20 text-amber-200 font-black text-xs uppercase tracking-[0.2em] hover:bg-amber-500 hover:text-black transition-all"
          >
            CALCULATE CGPA
          </button>
          <button
            onClick={reset}
            className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-600 hover:text-amber-500/60 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence>
          {cgpa !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-end gap-2"
            >
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em]">Calculated CGPA</p>
                  <p className={`text-4xl font-black tracking-tighter ${getGpaFeedback(cgpa).color}`}>
                    {cgpa.toFixed(2)}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-2xl border-2 ${getGpaFeedback(cgpa).border} ${getGpaFeedback(cgpa).bg} flex items-center justify-center relative overflow-hidden group`}>
                  <AnimatePresence mode="wait">
                    {cgpa >= 8.0 ? (
                      <motion.div
                        key="popper"
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="relative z-10"
                      >
                        <PartyPopper className={`w-6 h-6 ${getGpaFeedback(cgpa).color}`} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="sparkles"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="relative z-10"
                      >
                        <Sparkles className={`w-6 h-6 ${getGpaFeedback(cgpa).color}`} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                </div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`max-w-[340px] p-5 rounded-2xl border ${getGpaFeedback(cgpa).border} ${getGpaFeedback(cgpa).bg} backdrop-blur-md shadow-xl`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{getGpaFeedback(cgpa).emoji}</span>
                  <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${getGpaFeedback(cgpa).color}`}>
                    {getGpaFeedback(cgpa).label}
                  </span>
                </div>
                <p className="text-sm text-slate-200 font-light italic leading-relaxed">
                  "{getGpaFeedback(cgpa).message}"
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
