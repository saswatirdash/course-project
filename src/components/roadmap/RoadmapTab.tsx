import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Map as MapIcon, 
  Play, 
  Pause, 
  CheckCircle2, 
  Clock, 
  Zap, 
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Coffee,
  Plus,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  Trash2
} from "lucide-react";
import { Roadmap, RoadmapStatus, RoadmapSession } from "../../types";
import { useRoadmapTimer } from "../../hooks/useRoadmapTimer";
import { statsService } from "../../services/statsService";
import { roadmapService } from "../../services/roadmapService";
import { cn } from "../../lib/utils";
import confetti from "canvas-confetti";
import Markdown from "react-markdown";
import { toast } from "sonner";

interface SessionAiTutorProps {
  session: RoadmapSession;
}

function SessionAiTutor({ session }: SessionAiTutorProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setIsAsking(true);
    try {
      const res = await roadmapService.askAiAboutSession(session, question);
      setAnswer(res);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="mt-6 p-6 rounded-3xl bg-white/5 border border-amber-500/10 space-y-4">
      <div className="flex items-center gap-2 text-amber-500/60">
        <Sparkles className="w-4 h-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">AI Sanctuary Tutor</span>
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a doubt about this topic..."
          className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-200 focus:border-amber-500/40 transition-colors outline-none placeholder:text-slate-600 font-light"
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
        />
        <button
          onClick={handleAsk}
          disabled={isAsking || !question.trim()}
          className="px-6 py-2 bg-amber-500/20 text-amber-200 border border-amber-500/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-amber-900/10"
        >
          {isAsking ? "..." : "Ask"}
        </button>
      </div>

      <AnimatePresence>
        {answer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 bg-black/30 rounded-2xl border border-white/5"
          >
            <div className="prose prose-invert prose-sm max-w-none text-slate-400 leading-relaxed font-light font-sans">
              <Markdown components={{
                p: ({children}) => <p className="mb-3 last:mb-0">{children}</p>,
                ul: ({children}) => <ul className="list-disc pl-4 space-y-2 mb-3">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal pl-4 space-y-2 mb-3">{children}</ol>,
                li: ({children}) => <li className="marker:text-amber-500/50">{children}</li>,
                strong: ({children}) => <strong className="font-bold text-amber-200/80">{children}</strong>
              }}>
                {answer}
              </Markdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface RoadmapTabProps {
  roadmaps: Roadmap[];
  onOpenArchitect: () => void;
}

export function RoadmapTab({ roadmaps, onOpenArchitect }: RoadmapTabProps) {
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  const selectedRoadmap = roadmaps.find(r => r.id === selectedRoadmapId);
  const { sessions, toggleSession, markComplete: baseMarkComplete, resetSession } = useRoadmapTimer(selectedRoadmap || null);

  const deleteRoadmap = async (roadmap: Roadmap) => {
    if (confirmDeleteId !== roadmap.id) {
      setConfirmDeleteId(roadmap.id);
      setTimeout(() => setConfirmDeleteId(null), 3000); // Reset after 3s
      return;
    }
    
    setIsDeleting(true);
    try {
      await statsService.archiveRoadmap(roadmap.id);
      toast.success("Roadmap deleted successfully");
      if (selectedRoadmapId === roadmap.id) {
        setSelectedRoadmapId(null);
      }
      setConfirmDeleteId(null);
    } catch (error) {
      toast.error("Failed to delete roadmap");
    } finally {
      setIsDeleting(false);
    }
  };

  const markComplete = async (sessionId: string) => {
    await baseMarkComplete(sessionId);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#22C55E', '#A855F7', '#F59E0B']
    });
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!selectedRoadmap) {
    return (
      <div className="space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-100 uppercase tracking-tighter transition-all font-cursive">Your Sanctum</h2>
            <p className="text-slate-500 text-sm font-light italic">Select an arc to continue your mindful study journey.</p>
          </div>
          <button
            onClick={onOpenArchitect}
            className="group flex items-center gap-3 px-8 py-5 rounded-[32px] bg-amber-500/10 border border-amber-500/20 text-amber-200 font-black uppercase tracking-widest shadow-2xl hover:bg-amber-500 hover:text-black transition-all"
          >
            <Plus className="w-6 h-6" />
            Architect New Arc
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmaps.map((roadmap, i) => {
            const completed = roadmap.sessions.filter(s => s.status === RoadmapStatus.COMPLETED).length;
            const progressPercent = Math.round((completed / roadmap.sessions.length) * 100);
            
            return (
              <motion.div
                key={roadmap.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedRoadmapId(roadmap.id)}
                className="group relative cursor-pointer"
              >
                <div className="glass-card p-8 space-y-6 transition-all group-hover:border-amber-500/30 group-hover:shadow-[0_20px_50px_rgba(245,158,11,0.05)] overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <MapIcon className="w-24 h-24" />
                  </div>

                  <div className="space-y-2 relative">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500/60">
                      <Target className="w-3 h-3" />
                      {roadmap.timeframe} ARC
                    </div>
                    <h3 className="text-2xl font-bold text-slate-100 tracking-tight">{roadmap.title}</h3>
                  </div>

                  <div className="space-y-3 relative">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Progression</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        className="h-full bg-gradient-to-r from-amber-500/40 to-amber-200/20"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/5 relative">
                    <div className="flex items-center gap-2 text-slate-500">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-xs font-bold">{roadmap.sessions.length} milestones</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-500/60 group-hover:bg-amber-500 group-hover:text-black transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRoadmap(roadmap);
                    }}
                    className={cn(
                      "absolute top-4 right-4 p-2 rounded-xl border transition-all",
                      confirmDeleteId === roadmap.id 
                        ? "bg-red-500 border-red-600 text-white opacity-100 scale-110" 
                        : "bg-red-500/10 border-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white"
                    )}
                  >
                    {confirmDeleteId === roadmap.id ? <CheckCircle2 className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  const completedCount = sessions.filter(s => s.status === RoadmapStatus.COMPLETED).length;
  const progressPercent = Math.round((completedCount / sessions.length) * 100);

  return (
    <div className="space-y-12 pb-20">
      <button
        onClick={() => setSelectedRoadmapId(null)}
        className="group flex items-center gap-3 text-slate-500 hover:text-slate-200 transition-colors font-black uppercase tracking-widest text-[10px]"
      >
        <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
        Return to Sanctum
      </button>

      {/* Dynamic Header */}
      <div className="p-8 md:p-12 glass-card relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-10">
          <div className="relative group/orb">
             {/* Glowing Ambient Background */}
             <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-amber-200/5 blur-2xl rounded-full scale-110 group-hover/orb:scale-125 transition-transform duration-700" />
             
             {/* Minimalist Glass Box */}
             <div className="relative w-32 h-32 rounded-[48px] bg-white/5 backdrop-blur-3xl border border-white/5 flex items-center justify-center shadow-2xl overflow-hidden group-hover/orb:border-white/10 transition-all duration-500">
               <Sparkles className="w-12 h-12 text-amber-500/60 drop-shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover/orb:scale-110 transition-transform duration-500" />
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-2 border border-dashed border-white/5 rounded-full"
               />
             </div>
             
             <div className="absolute -bottom-1 -right-1 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl">
               <span className="text-amber-500/60 font-black text-[10px] uppercase tracking-widest">{progressPercent}%</span>
             </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-100 uppercase tracking-tighter font-cursive">{selectedRoadmap.title}</h2>
              <p className="text-slate-500 text-sm font-light italic tracking-wide">Archived Arc • {selectedRoadmap.timeframe}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-600">
                <span>Arc Integrity</span>
                <span>{completedCount} / {sessions.length} Sessions</span>
              </div>
              <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-gradient-to-r from-amber-500/40 to-amber-200/10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Delete Roadmap Option */}
        <button
          onClick={() => selectedRoadmap && deleteRoadmap(selectedRoadmap)}
          disabled={isDeleting}
          className={cn(
            "absolute bottom-4 left-6 flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-[8px] font-black uppercase tracking-widest disabled:opacity-50 group/del",
            confirmDeleteId === selectedRoadmap?.id
              ? "text-red-500 bg-red-500/10 border border-red-500/20 scale-110"
              : "text-slate-700 hover:text-red-400 hover:bg-red-500/5"
          )}
        >
          <Trash2 className="w-3 h-3 opacity-50 group-hover/del:opacity-100 transition-opacity" />
          {isDeleting ? "..." : confirmDeleteId === selectedRoadmap?.id ? "Confirm?" : "Archive Arc"}
        </button>
      </div>

      {/* Interactive Timeline */}
      <div className="relative space-y-8 pl-8">
        <div className="absolute left-3 top-2 bottom-0 w-[2px] bg-gradient-to-b from-amber-500/10 via-amber-200/5 to-transparent opacity-20" />

        {sessions.map((session, i) => {
          const isOngoing = session.status === RoadmapStatus.ONGOING;
          const isCompleted = session.status === RoadmapStatus.COMPLETED;
          const isPaused = session.status === RoadmapStatus.PAUSED;

          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative group transition-all duration-500",
                isCompleted && "opacity-40 grayscale-[0.5]"
              )}
            >
              <div className={cn(
                "absolute -left-[29px] top-6 w-4 h-4 rounded-full border-2 transition-all z-10",
                isCompleted ? "bg-green-500/50 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" :
                isOngoing ? "bg-amber-500 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse" :
                "bg-[#0F172A] border-white/10"
              )} />

              <div className={cn(
                "glass-card p-8 transition-all hover:shadow-2xl space-y-6",
                isOngoing ? "border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.05)] bg-white/5 scale-[1.01]" : 
                "border-white/5"
              )}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                       <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                        isCompleted ? "bg-green-500/5 text-green-500/60" :
                        isOngoing ? "bg-amber-500/10 text-amber-500" :
                        isPaused ? "bg-slate-500/5 text-slate-500" :
                        "bg-white/5 text-slate-600"
                      )}>
                        {isCompleted ? "Complete" : isOngoing ? "In Flow" : isPaused ? "Intermission" : "Future Session"}
                      </span>
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest italic">
                        {session.startTime} — {session.endTime} ({session.duration})
                      </span>
                    </div>
                    <h4 className="text-xl font-medium text-slate-200 tracking-tight font-sans">{session.title}</h4>
                  </div>

                  <div className="flex items-center gap-3">
                    {session.elapsedSeconds > 0 && (
                      <div className="flex flex-col items-end px-4 border-r border-white/5">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Session Time</span>
                        <span className="text-sm font-mono font-bold text-amber-500/60">{formatTime(session.elapsedSeconds)}</span>
                      </div>
                    )}
                    
                    {!isCompleted ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleSession(session.id)}
                          className={cn(
                            "p-4 rounded-2xl transition-all shadow-xl",
                            isOngoing 
                              ? "bg-white/10 text-amber-500 border border-amber-500/20 scale-110" 
                              : "bg-amber-500/80 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                          )}
                        >
                          {isOngoing ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </button>
                        <button
                          onClick={() => markComplete(session.id)}
                          className="p-4 rounded-2xl bg-white/5 text-slate-500 border border-white/10 hover:bg-green-500 hover:text-white transition-all shadow-xl"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => resetSession(session.id)}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-700 hover:text-amber-500 transition-all font-cursive text-sm"
                        title="Revisit Session"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {isOngoing && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-amber-500/5 rounded-2xl p-6 border border-amber-500/10 space-y-4"
                    >
                      <div className="flex items-center gap-2 text-amber-500/60">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Deep Work Active</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed italic font-light">
                        Mindfulness is the key to mastery. Focus deeply on {session.duration} of intent.
                      </p>
                    </motion.div>
                  )}

                  {isPaused && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-white/5 rounded-2xl p-6 border border-white/10 flex items-center gap-4"
                    >
                      <Coffee className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">A Moment to Breathe</p>
                        <p className="text-[10px] text-slate-700 font-light italic">The ARC is paused. Re-enter the flow when ready.</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {session.topics.map((topic, ti) => (
                      <span key={ti} className="text-[10px] bg-black/20 px-3 py-1.5 rounded-lg border border-white/5 text-slate-500 font-light">
                        {topic}
                      </span>
                    ))}
                  </div>

                  {!isCompleted && <SessionAiTutor session={session} />}

                  {session.tips && !isCompleted && (
                    <div className="p-4 bg-white/5 rounded-2xl border-l border-amber-500/20">
                      <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-1">Architect Strategy</p>
                      <p className="text-xs text-slate-600 font-light italic leading-relaxed font-sans">"{session.tips}"</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
