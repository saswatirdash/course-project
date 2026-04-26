import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Map as MapIcon, 
  Upload, 
  Calendar, 
  Clock, 
  Zap, 
  ChevronRight, 
  Loader2, 
  Sparkles,
  BookOpen,
  Target,
  ArrowRight
} from "lucide-react";
import { roadmapService, RoadmapResponse } from "../../services/roadmapService";
import { statsService } from "../../services/statsService";
import { useAuth } from "../../hooks/useAuth";
import { RoadmapStatus, RoadmapSession } from "../../types";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

import { useNotifications } from "../../hooks/useNotifications";

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

enum Step {
  INPUT,
  GENERATING,
  VIEW
}

export function RoadmapModal({ isOpen, onClose }: RoadmapModalProps) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [step, setStep] = useState<Step>(Step.INPUT);
  const [syllabusText, setSyllabusText] = useState("");
  const [timeValue, setTimeValue] = useState("3");
  const [timeUnit, setTimeUnit] = useState<"days" | "weeks" | "hours">("days");
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!syllabusText.trim()) {
      toast.error("Please provide your syllabus content first!");
      return;
    }

    setStep(Step.GENERATING);
    try {
      const timeframe = `${timeValue} ${timeUnit}`;
      const result = await roadmapService.generateRoadmap(syllabusText, timeframe);
      setRoadmap(result);
      setStep(Step.VIEW);
      toast.success("Roadmap Architected Successfully!");
    } catch (error: any) {
      toast.error(error.message);
      setStep(Step.INPUT);
    }
  };

  const handleApplyRoadmap = async () => {
    if (!user || !roadmap) return;
    setIsSaving(true);
    try {
      // If there's an existing active roadmap, we might want to archive it first
      // But for simplicity, we'll just create a new one.
      
      const sessionWithDefaults: RoadmapSession[] = roadmap.sessions.map((s, i) => ({
        ...s,
        id: crypto.randomUUID(),
        status: RoadmapStatus.PENDING,
        elapsedSeconds: 0,
        lastStartedAt: null
      }));

      await statsService.createRoadmap({
        userId: user.uid,
        title: `Exam Prep (${timeValue} ${timeUnit})`,
        syllabus: syllabusText,
        timeframe: `${timeValue} ${timeUnit}`,
        totalStudyHours: roadmap.totalStudyHours,
        sessions: sessionWithDefaults,
        createdAt: new Date().toISOString(),
        isArchived: false
      });

      toast.success("Roadmap initialized! Visit the Roadmap tab to start tracking.");
      addNotification(
        "Roadmap Manifested",
        `Your AI-architected strategy for ${timeValue} ${timeUnit} is live. View it in the Plan tab.`,
        'success'
      );
      onClose();
    } catch (error) {
      toast.error("Failed to save roadmap profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.info("Extracting syllabus details...");
      // For now, we'll suggest sticking to text or we can implement real extraction
      // But Gemini can read the file if we send it as a part. 
      // For simplicity in this demo, let's allow content paste or simulated file read.
      const reader = new FileReader();
      reader.onload = (event) => {
        setSyllabusText(event.target?.result as string);
        toast.success("Content extracted!");
      };
      reader.readAsText(file);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl glass-card overflow-hidden shadow-[0_0_100px_rgba(245,158,11,0.05)] bg-[#050508]/95"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-amber-500/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                <MapIcon className="w-6 h-6 text-amber-500/60" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-100 uppercase tracking-widest font-cursive">Roadmap Architect</h2>
                <p className="text-xs text-slate-500 font-light italic">Design your path to academic victory</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 text-slate-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {step === Step.INPUT && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                {/* Syllabus Input */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] font-mono">Syllabus Details</label>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] font-black text-amber-500/60 hover:text-amber-500 flex items-center gap-1 uppercase tracking-widest font-mono transition-colors"
                    >
                      <Upload className="w-3 h-3" /> Transcribe Scroll
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept=".txt,.md" />
                  </div>
                  <textarea
                    value={syllabusText}
                    onChange={(e) => setSyllabusText(e.target.value)}
                    placeholder="Bestow your chapters, topics, or scrolls here..."
                    className="w-full h-40 bg-black/40 border border-white/5 rounded-2xl p-6 text-sm text-slate-300 placeholder:text-slate-800 focus:outline-none focus:border-amber-500/20 transition-all font-light font-mono resize-none shadow-inner"
                  />
                </div>

                {/* Timeframe Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] font-mono">Temporal Constraints</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex bg-black/40 border border-white/5 rounded-2xl p-2 gap-2 shadow-inner">
                      <input 
                        type="number" 
                        value={timeValue}
                        onChange={(e) => setTimeValue(e.target.value)}
                        className="w-full bg-transparent border-none p-4 text-2xl font-black text-slate-100 focus:outline-none font-mono"
                      />
                      <div className="flex flex-col border-l border-white/5 pr-2 gap-1 py-1">
                        {(['days', 'weeks', 'hours'] as const).map((u) => (
                          <button
                            key={u}
                            onClick={() => setTimeUnit(u)}
                            className={cn(
                              "flex-1 px-4 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all font-mono",
                              timeUnit === u ? "bg-amber-500/20 text-amber-100" : "text-slate-700 hover:text-slate-500"
                            )}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 flex items-center gap-4">
                      <Clock className="w-8 h-8 text-amber-500/20 grayscale" />
                      <p className="text-xs text-slate-600 leading-relaxed font-light italic">
                        Allocating a <span className="text-amber-500/60 font-black">{timeValue} {timeUnit}</span> window for mastery. The AI Architect will optimize topic entropy accordingly.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  className="w-full py-6 rounded-[32px] bg-amber-500/20 text-amber-100 border border-amber-500/20 font-black text-lg uppercase tracking-[0.3em] font-cursive shadow-[0_20px_50px_rgba(245,158,11,0.05)] hover:bg-amber-500 hover:text-black transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <Sparkles className="w-6 h-6" />
                  Begin Architecture
                </button>
              </motion.div>
            )}

            {step === Step.GENERATING && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 flex flex-col items-center justify-center space-y-8"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 rounded-full border-t border-b border-amber-500/20"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-amber-500/40 animate-spin" />
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-4 -right-4 p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-xl"
                  >
                    <Target className="w-6 h-6 text-amber-500/60" />
                  </motion.div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-slate-100 font-cursive uppercase tracking-widest">Architect Sensing...</h3>
                  <p className="text-slate-600 text-xs font-light italic max-w-xs leading-relaxed">
                    Synthesizing syllabus entropy with temporal constraints for optimal academic manifestation.
                  </p>
                </div>
              </motion.div>
            )}

            {step === Step.VIEW && roadmap && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12 pb-12"
              >
                {/* Overview Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-6 shadow-inner">
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1 font-mono">Temporal Cost</p>
                    <p className="text-2xl font-black text-amber-500/60 font-mono">{roadmap.totalStudyHours}h</p>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-6 shadow-inner">
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1 font-mono">Milestones</p>
                    <p className="text-2xl font-black text-purple-400/60 font-mono">{roadmap.sessions.length} Phase{roadmap.sessions.length > 1 ? 's' : ''}</p>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-6 shadow-inner">
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1 font-mono">Complexity</p>
                    <p className="text-2xl font-black text-emerald-500/40 font-mono">Harmonized</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="relative space-y-8 pl-8">
                  {/* Vertical Line */}
                  <div className="absolute left-3 top-2 bottom-0 w-[1px] bg-gradient-to-b from-amber-500/40 via-purple-500/20 to-transparent opacity-20" />

                  {roadmap.sessions.map((session, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative group outline-none"
                    >
                      {/* Node Circle */}
                      <div className="absolute -left-[32px] top-4 w-3 h-3 rounded-full border border-amber-500/40 bg-[#050508] z-10 group-hover:scale-150 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]" />
                      
                      <div className="bg-black/20 border border-white/5 rounded-3xl p-8 hover:border-amber-500/20 transition-all duration-500 shadow-xl space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest bg-amber-500/5 px-3 py-1 rounded-full border border-amber-500/10 font-mono">
                              {session.startTime} — {session.endTime}
                            </span>
                            <h4 className="text-xl font-bold text-slate-300 pt-2 tracking-tight">{session.title}</h4>
                          </div>
                          <div className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border font-mono",
                            session.priority === 'high' ? "bg-red-500/5 text-red-400/60 border-red-500/10" :
                            session.priority === 'medium' ? "bg-amber-500/5 text-amber-500/60 border-amber-500/10" :
                            "bg-emerald-500/5 text-emerald-500/60 border-emerald-500/10"
                          )}>
                            <Zap className="w-3 h-3" />
                            {session.priority} Priority
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {session.topics.map((topic, ti) => (
                              <span key={ti} className="text-xs bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-slate-400 font-light italic">
                                {topic}
                              </span>
                            ))}
                          </div>
                          
                          {session.tips && (
                            <div className="bg-amber-500/5 rounded-2xl p-4 border-l border-amber-500/20 space-y-1">
                              <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest font-mono">Architect's Guidance</p>
                              <p className="text-xs text-slate-500 font-light italic leading-relaxed">"{session.tips}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    onClick={() => setStep(Step.INPUT)}
                    className="flex-1 py-5 rounded-[32px] bg-black/40 border border-white/5 text-slate-600 font-black text-xs uppercase tracking-widest hover:text-slate-400 transition-all font-mono"
                  >
                    Adjust Mandate
                  </button>
                  <button
                    onClick={handleApplyRoadmap}
                    disabled={isSaving}
                    className="flex-[2] py-5 rounded-[32px] bg-amber-500/20 text-amber-100 border border-amber-500/20 font-black text-xs uppercase tracking-[0.3em] hover:bg-amber-500 hover:text-black transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-cursive underline decoration-amber-500/10 underline-offset-8"
                  >
                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : "Manifest Roadmap"}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
