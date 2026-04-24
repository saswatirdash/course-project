import React, { useState } from "react";
import { BookOpen, Plus, Trash2, ChevronRight, CheckCircle2, Circle, MoreVertical, Book } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSyllabus, useChapters } from "../../hooks/useSyllabus";
import { syllabusService } from "../../services/syllabusService";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

import { useNotifications } from "../../hooks/useNotifications";

export function SubjectList() {
  const { subjects, loading } = useSyllabus();
  const { addNotification } = useNotifications();
  const [isAdding, setIsAdding] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return;
    try {
      await syllabusService.addSubject(newSubjectName);
      setNewSubjectName("");
      setIsAdding(false);
      toast.success("Subject added!");
      addNotification(
        "Archive Expanded",
        `'${newSubjectName}' is now being tracked in your academic sanctuary.`,
        'success'
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to add subject");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono">Academic Archives</h4>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 text-[10px] font-black text-amber-500/60 uppercase tracking-widest hover:text-amber-500 transition-colors font-mono"
        >
          <Plus className="w-4 h-4" />
          Commence Tracking
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {subjects.map((subject) => (
            <div key={subject.id}>
              <SubjectCard subject={subject} />
            </div>
          ))}
        </AnimatePresence>
        
        {subjects.length === 0 && !loading && (
          <div className="col-span-full p-12 text-center rounded-3xl border border-dashed border-white/5 glass-card shadow-inner">
            <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4 grayscale" />
            <p className="text-slate-500 text-sm font-light italic leading-relaxed">No rituals logged yet. Begin your academic journey by adding a subject.</p>
          </div>
        )}
      </div>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm glass-card p-8 shadow-2xl space-y-6"
            >
              <h3 className="text-xl font-black text-slate-100 text-center uppercase tracking-widest font-cursive">New Archive</h3>
              <input 
                type="text" 
                autoFocus
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                placeholder="e.g. Neural Networks"
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-300 font-mono outline-none focus:border-amber-500/30 transition-all placeholder:text-slate-800"
              />
              <div className="flex gap-4">
                <button onClick={() => setIsAdding(false)} className="flex-1 py-3 rounded-xl bg-black/40 border border-white/5 text-slate-600 font-black text-xs uppercase tracking-widest font-mono">Cancel</button>
                <button onClick={handleAddSubject} className="flex-1 py-3 rounded-xl bg-amber-500/20 text-amber-100 border border-amber-500/20 font-black text-xs uppercase tracking-[0.2em] font-mono">Archive</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SubjectCard({ subject }: { subject: any }) {
  const { chapters, loading } = useChapters(subject.id);
  const { addNotification } = useNotifications();
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterName, setNewChapterName] = useState("");

  const completedCount = chapters.filter(c => c.isCompleted).length;
  const progress = chapters.length > 0 ? (completedCount / chapters.length) * 100 : 0;

  const handleAddChapter = async () => {
    if (!newChapterName.trim()) return;
    try {
      await syllabusService.addChapter(subject.id, newChapterName);
      setNewChapterName("");
      setIsAddingChapter(false);
      toast.success("Chapter added!");
      addNotification(
        "Ritual Added",
        `New scroll '${newChapterName}' added to ${subject.name}.`,
        'info'
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to add chapter");
    }
  };

  const handleDeleteSubject = async () => {
    if (window.confirm(`Delete ${subject.name} and all its chapters?`)) {
      try {
        await syllabusService.deleteSubject(subject.id);
        toast.info("Subject deleted");
      } catch (error: any) {
        toast.error(error.message || "Delete failed");
      }
    }
  };

  return (
    <motion.div 
      layout
      className="glass-card overflow-hidden flex flex-col h-full group transition-all duration-500 hover:border-amber-500/20"
    >
      <div className="p-5 border-b border-white/5 bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/5 text-amber-500/60 border border-amber-500/10 grayscale group-hover:grayscale-0 transition-all">
            <Book className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-sm font-bold text-slate-300 tracking-tight">{subject.name}</h5>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest font-mono">{chapters.length} Scrolls</p>
          </div>
        </div>
        <button onClick={handleDeleteSubject} className="p-2 rounded-lg text-slate-700 hover:text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 p-5 space-y-4">
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-600 font-mono">
            <span>Calibrated Mastery</span>
            <span className="text-amber-500/60">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-black/40 rounded-full border border-white/5 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
            />
          </div>
        </div>

        {/* Chapters List */}
        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
          {chapters.map((chapter) => (
            <div key={chapter.id}>
              <ChapterItem chapter={chapter} />
            </div>
          ))}
          
          {isAddingChapter ? (
            <div className="flex gap-2">
              <input 
                autoFocus
                value={newChapterName}
                onChange={(e) => setNewChapterName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddChapter()}
                className="flex-1 bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono outline-none focus:border-amber-500/20"
                placeholder="Ritual name..."
              />
              <button onClick={handleAddChapter} className="p-1.5 rounded-lg bg-amber-500/20 text-amber-200 hover:bg-amber-500 hover:text-black transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAddingChapter(true)}
              className="w-full py-2 rounded-lg border border-dashed border-white/5 text-slate-700 hover:text-slate-500 hover:border-amber-500/20 text-[10px] font-black uppercase tracking-widest transition-all font-mono"
            >
              + Add Scroll
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ChapterItem({ chapter }: { chapter: any }) {
  const { addNotification } = useNotifications();
  const [isMastering, setIsMastering] = useState(false);

  const toggleMastery = async (field: string) => {
    try {
      const updatedValue = !chapter[field];
      await syllabusService.updateChapterMastery(chapter.id, { [field]: updatedValue });
      toast.success("Progress updated!");

      // Check if this was the last requirement for mastery
      const requirements = ['isLectureDone', 'isDppDone', 'isRefBookDone', 'isPyqDone'];
      const currentStatus = requirements.map(r => r === field ? updatedValue : chapter[r]);
      const isNowFullyMastered = currentStatus.every(s => s === true);

      if (isNowFullyMastered && !chapter.isCompleted) {
        addNotification(
          "Ritual Perfected",
          `You have achieved total mastery over '${chapter.name}'. Glory to the scribe!`,
          'success'
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Update failed");
    }
  };

  return (
    <div className="group/item">
      <div className="flex items-center justify-between p-2 rounded-xl bg-black/20 border border-white/5 hover:border-amber-500/20 transition-all group-hover/item:bg-amber-500/5">
        <div className="flex items-center gap-3">
          {chapter.isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500/60" />
          ) : (
            <Circle className="w-4 h-4 text-slate-800" />
          )}
          <span className={cn("text-xs font-medium transition-colors", chapter.isCompleted ? "text-slate-200" : "text-slate-500 group-hover/item:text-slate-400")}>
            {chapter.name}
          </span>
        </div>
        <button 
          onClick={() => setIsMastering(!isMastering)}
          className="p-1 rounded-lg text-slate-700 hover:text-amber-500/60 opacity-0 group-hover/item:opacity-100 transition-all"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {isMastering && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2 p-2 mt-1 bg-black/40 rounded-xl border border-white/5">
              <MasteryToggle label="Lecture" active={chapter.isLectureDone} onClick={() => toggleMastery("isLectureDone")} />
              <MasteryToggle label="Refined Note" active={chapter.isDppDone} onClick={() => toggleMastery("isDppDone")} />
              <MasteryToggle label="Scroll Study" active={chapter.isRefBookDone} onClick={() => toggleMastery("isRefBookDone")} />
              <MasteryToggle label="Trials" active={chapter.isPyqDone} onClick={() => toggleMastery("isPyqDone")} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MasteryToggle({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all font-mono",
        active 
          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500/60" 
          : "bg-white/5 border-white/5 text-slate-700 hover:text-slate-500"
      )}
    >
      {label}
      {active && <CheckCircle2 className="w-2.5 h-2.5 ml-1" />}
    </button>
  );
}
