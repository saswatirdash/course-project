import React, { useState } from "react";
import { GraduationCap, TrendingUp, AlertCircle, Plus, ChevronRight, Trash2, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSemesters, useSubjectGrades, useBacklogs } from "../../hooks/useSemester";
import { semesterService } from "../../services/semesterService";
import { calculateCGPA, calculateGPA } from "../../lib/stats";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

import { useNotifications } from "../../hooks/useNotifications";

export function SemesterDashboard() {
  const { semesters, loading } = useSemesters();
  const { backlogs: backlogGrades } = useBacklogs();
  const { addNotification } = useNotifications();
  const [isAdding, setIsAdding] = useState(false);
  const [newSemNumber, setNewSemNumber] = useState(1);

  const cgpa = calculateCGPA(semesters.map(s => s.gpa || 0));
  const backlogs = backlogGrades.length;

  const handleAddSemester = async () => {
    try {
      await semesterService.addSemester(newSemNumber);
      setIsAdding(false);
      toast.success(`Semester ${newSemNumber} added!`);
      addNotification(
        "Semester Initialized", 
        `Semester ${newSemNumber} is now part of your academic track.`,
        'success'
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to add semester");
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 glass-card relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/5 blur-[40px] rounded-full group-hover:bg-amber-500/10 transition-all duration-500" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 rounded-xl bg-amber-500/5 text-amber-500/60 border border-amber-500/10">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Master CGPA</p>
              <h3 className="text-3xl font-black text-slate-100 tracking-tight">{cgpa.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        <div className="p-6 glass-card relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/5 blur-[40px] rounded-full group-hover:bg-amber-500/10 transition-all duration-500" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 rounded-xl bg-amber-500/5 text-amber-500/60 border border-amber-500/10">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Semesters Completed</p>
              <h3 className="text-3xl font-black text-slate-100 tracking-tight">{semesters.length}</h3>
            </div>
          </div>
        </div>

        <div className="p-6 glass-card relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/5 blur-[40px] rounded-full group-hover:bg-red-500/10 transition-all duration-500" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 rounded-xl bg-red-500/5 text-red-400/60 border border-red-500/10">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Backlogs</p>
              <h3 className="text-3xl font-black text-slate-100 tracking-tight">{backlogs}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Semester List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Semesters</h4>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-[10px] font-black text-amber-500/60 uppercase tracking-widest hover:text-amber-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Semester
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {semesters.map((sem) => (
              <div key={sem.id}>
                <SemesterCard semester={sem} />
              </div>
            ))}
          </AnimatePresence>
          
          {semesters.length === 0 && !loading && (
            <div className="p-12 text-center rounded-[32px] border border-dashed border-white/5 bg-black/40">
              <GraduationCap className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest italic">No semesters added yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Semester Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm glass-card p-10 shadow-2xl space-y-8 bg-[#050508]/90"
            >
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-slate-100 font-cursive uppercase tracking-widest">New Semester</h3>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest font-mono">Select semester number</p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <button
                    key={num}
                    onClick={() => setNewSemNumber(num)}
                    className={cn(
                      "h-12 rounded-xl border font-black transition-all font-mono text-xs",
                      newSemNumber === num 
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.1)]" 
                        : "bg-black/40 border-white/5 text-slate-700 hover:text-slate-500"
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-4 rounded-2xl bg-black/40 border border-white/5 text-slate-600 font-black text-[10px] uppercase tracking-widest font-mono transition-colors hover:text-slate-500"
                >
                  Withdraw
                </button>
                <button 
                  onClick={handleAddSemester}
                  className="flex-1 py-4 rounded-2xl bg-amber-500/20 text-amber-100 border border-amber-500/20 font-black text-[10px] uppercase tracking-widest font-mono shadow-[0_10px_30px_rgba(245,158,11,0.1)] hover:bg-amber-500 hover:text-black transition-all"
                >
                  Start Semester
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SemesterCard({ semester }: { semester: any }) {
  const { grades, loading } = useSubjectGrades(semester.id);
  const { addNotification } = useNotifications();
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const [isExpanded, setIsExpanded] = useState(semester.isActive);

  const [newGrade, setNewGrade] = useState({
    subjectName: "",
    credits: 3,
    grade: "A",
    gradePoint: 9,
    hasBacklog: false
  });

  const handleAddGrade = async () => {
    try {
      await semesterService.addSubjectGrade(semester.id, newGrade);
      setIsAddingGrade(false);
      setNewGrade({ subjectName: "", credits: 3, grade: "A", gradePoint: 9, hasBacklog: false });
      toast.success("Grade added!");
      addNotification(
        "Grade Archived",
        `${newGrade.subjectName} has been added to Semester ${semester.number}.`,
        'success'
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to add grade");
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingGradeId, setDeletingGradeId] = useState<string | null>(null);

  const handleDeleteSemester = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
      return;
    }

    try {
      await semesterService.deleteSemester(semester.id);
      toast.success(`Semester ${semester.number} deleted`);
      addNotification(
        "Semester Purged",
        `Semester ${semester.number} and all its records have been removed.`,
        'success'
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to delete semester");
    }
  };

  const handleDeleteGrade = async (gradeId: string) => {
    if (deletingGradeId !== gradeId) {
      setDeletingGradeId(gradeId);
      setTimeout(() => setDeletingGradeId(null), 3000);
      return;
    }

    try {
      await semesterService.deleteSubjectGrade(gradeId, semester.id);
      toast.success("Subject deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete subject");
    } finally {
      setDeletingGradeId(null);
    }
  };

  const gpaColor = semester.gpa >= 8 ? "text-amber-400" : semester.gpa >= 6 ? "text-amber-600/80" : "text-red-400/60";

  return (
    <motion.div 
      layout
      className="glass-card overflow-hidden group/card relative"
    >
      {/* Delete Option - absolute positioned in corner */}
      <button 
        onClick={handleDeleteSemester}
        className={cn(
          "absolute top-2 right-2 p-2.5 rounded-xl transition-all z-20 group-hover/card:opacity-100",
          showDeleteConfirm 
            ? "bg-red-500 border border-red-500/50 text-white scale-110 opacity-100 shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
            : "bg-black/40 border border-white/5 text-slate-700 hover:text-red-500/80 hover:bg-red-500/5 hover:border-red-500/10 opacity-40 lg:opacity-0"
        )}
        title={showDeleteConfirm ? "Click again to confirm" : "Delete Semester"}
      >
        {showDeleteConfirm ? (
          <span className="text-[8px] font-black uppercase tracking-widest px-1">Confirm</span>
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>

      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] border transition-all uppercase tracking-widest font-mono",
            semester.isActive ? "bg-amber-500/20 border-amber-500/20 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]" : "bg-white/5 border-white/5 text-slate-600"
          )}>
            SEM {semester.number}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 font-cursive">Semester {semester.number}</h4>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{grades.length} Subjects in Record</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Semester GPA</p>
            <p className={cn("text-lg font-black tracking-tighter", gpaColor)}>{semester.gpa?.toFixed(2) || "0.00"}</p>
          </div>
          <ChevronRight className={cn("w-5 h-5 text-slate-600 transition-transform", isExpanded ? "rotate-90" : "")} />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="border-t border-white/5 bg-black/20"
          >
            <div className="p-4 space-y-4">
              {/* Grades Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="text-slate-600 uppercase tracking-widest font-black border-b border-white/5">
                      <th className="pb-2 pl-2">Subject</th>
                      <th className="pb-2">Weight</th>
                      <th className="pb-2">Mastery</th>
                      <th className="pb-2">Index</th>
                      <th className="pb-2">Continuity</th>
                      <th className="pb-2 text-right pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {grades.map((grade) => (
                      <tr key={grade.id} className="group/row hover:bg-white/5 transition-colors">
                        <td className="py-3 pl-2 font-bold text-slate-300">{grade.subjectName}</td>
                        <td className="py-3 text-slate-500">{grade.credits} Cr</td>
                        <td className="py-3 font-black text-amber-500/60">{grade.grade || "-"}</td>
                        <td className="py-3 font-mono text-slate-400">{grade.gradePoint?.toFixed(1) || "-"}</td>
                        <td className="py-3">
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await semesterService.markBacklog(grade.id, !grade.hasBacklog);
                              } catch (error: any) {
                                toast.error("Failed to update status");
                              }
                            }}
                            className={cn(
                              "px-2 py-0.5 rounded-full border font-black text-[8px] uppercase tracking-widest transition-all hover:scale-105",
                              grade.hasBacklog 
                                ? "bg-red-500/10 border-red-500/20 text-red-400/60 hover:bg-red-500/20" 
                                : "bg-amber-500/10 border-amber-500/20 text-amber-500/60 hover:bg-amber-500/20"
                            )}
                          >
                            {grade.hasBacklog ? "Backlog" : "Cleared"}
                          </button>
                        </td>
                        <td className="py-3 text-right pr-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGrade(grade.id);
                            }}
                            className={cn(
                              "p-1.5 rounded-md transition-all",
                              deletingGradeId === grade.id 
                                ? "bg-red-500 text-white scale-110 shadow-lg" 
                                : "hover:bg-red-500/10 text-slate-700 hover:text-red-500/60"
                            )}
                            title={deletingGradeId === grade.id ? "Click again to confirm" : "Delete subject"}
                          >
                            {deletingGradeId === grade.id ? (
                              <span className="text-[7px] font-black uppercase px-0.5">Confirm</span>
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Grade Form */}
              {isAddingGrade ? (
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Label</label>
                      <input 
                        type="text" 
                        value={newGrade.subjectName}
                        onChange={(e) => setNewGrade({...newGrade, subjectName: e.target.value})}
                        className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500/30"
                        placeholder="Subject title..."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Credits</label>
                        <input 
                          type="number" 
                          value={isNaN(newGrade.credits) ? "" : newGrade.credits}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setNewGrade({...newGrade, credits: isNaN(val) ? NaN : val});
                          }}
                          className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Grade</label>
                        <input 
                          type="text" 
                          value={newGrade.grade}
                          onChange={(e) => setNewGrade({...newGrade, grade: e.target.value})}
                          className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Point</label>
                        <input 
                          type="number" 
                          value={isNaN(newGrade.gradePoint) ? "" : newGrade.gradePoint}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setNewGrade({...newGrade, gradePoint: isNaN(val) ? NaN : val});
                          }}
                          className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 px-1">
                    <button
                      onClick={() => setNewGrade({...newGrade, hasBacklog: !newGrade.hasBacklog})}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all",
                        newGrade.hasBacklog 
                          ? "bg-red-500/20 border-red-500/20 text-red-100 shadow-[0_0_12px_rgba(239,68,68,0.1)]" 
                          : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
                      )}
                    >
                      <AlertCircle className="w-3 h-3" />
                      Mark as Backlog
                    </button>
                    <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest italic">
                      {newGrade.hasBacklog ? "Currently failing this subject" : "Subject is cleared"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsAddingGrade(false)}
                      className="flex-1 py-2 rounded-lg bg-white/5 text-slate-500 font-bold text-xs"
                    >
                      Dismiss
                    </button>
                    <button 
                      onClick={handleAddGrade}
                      className="flex-1 py-2 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/20 font-bold text-xs"
                    >
                      Archive Grade
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingGrade(true)}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-white/5 text-slate-600 hover:text-slate-400 hover:border-white/10 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                  <Plus className="w-3 h-3" />
                  Add Subject
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
