import React, { useState, lazy, Suspense } from "react";
import { useAuth } from "./hooks/useAuth";
import { useStats } from "./hooks/useStats";
import { Sidebar } from "./components/layout/Sidebar";
import { TopNav } from "./components/layout/TopNav";
import { AiBuddyBubble } from "./components/layout/AiBuddyBubble";
import { LandingPage } from "./components/auth/LandingPage";

// Lazy load heavy components
const PlayerCard = lazy(() => import("./components/dashboard/PlayerCard").then(m => ({ default: m.PlayerCard })));
const DailyTargetCard = lazy(() => import("./components/dashboard/DailyTargetCard").then(m => ({ default: m.DailyTargetCard })));
const StudyInput = lazy(() => import("./components/dashboard/StudyInput").then(m => ({ default: m.StudyInput })));
const ActionGrids = lazy(() => import("./components/dashboard/ActionGrids").then(m => ({ default: m.ActionGrids })));
const PulseFeed = lazy(() => import("./components/dashboard/PulseFeed").then(m => ({ default: m.PulseFeed })));
const DayCompletionModal = lazy(() => import("./components/dashboard/DayCompletionModal").then(m => ({ default: m.DayCompletionModal })));
const PomodoroTimer = lazy(() => import("./components/pomodoro/PomodoroTimer").then(m => ({ default: m.PomodoroTimer })));
const SubjectList = lazy(() => import("./components/syllabus/SubjectList").then(m => ({ default: m.SubjectList })));
const SemesterDashboard = lazy(() => import("./components/semester/SemesterDashboard").then(m => ({ default: m.SemesterDashboard })));
const CertificationBoard = lazy(() => import("./components/certifications/CertificationBoard").then(m => ({ default: m.CertificationBoard })));
const ProgressChart = lazy(() => import("./components/dashboard/ProgressChart").then(m => ({ default: m.ProgressChart })));
const GpaTracker = lazy(() => import("./components/dashboard/GpaTracker").then(m => ({ default: m.GpaTracker })));
const RoadmapModal = lazy(() => import("./components/roadmap/RoadmapModal").then(m => ({ default: m.RoadmapModal })));
const RoadmapTab = lazy(() => import("./components/roadmap/RoadmapTab").then(m => ({ default: m.RoadmapTab })));

import { Toaster, toast } from "sonner";
import { Loader2, LayoutDashboard, BookOpen, Timer, GraduationCap, History, Settings, Sparkles, Trash2, LogOut, ChevronRight, Moon, CheckCircle2, Map as MapIcon, Calendar, ArrowRight, Upload, Zap, Trophy, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BtechYear, Roadmap } from "./types";
import { getYearLabel } from "./lib/stats";
import { statsService } from "./services/statsService";
import { semesterService } from "./services/semesterService";
import { authService } from "./services/authService";
import { useSemesters } from "./hooks/useSemester";
import { cn } from "./lib/utils";

const YEAR_SEMESTER_MAP: Record<BtechYear, number[]> = {
  [BtechYear.FIRST]: [1, 2],
  [BtechYear.SECOND]: [3, 4],
  [BtechYear.THIRD]: [5, 6],
  [BtechYear.FOURTH]: [7, 8],
};

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { userStats, todayLog, roadmaps, loading: statsLoading } = useStats();
  const { semesters } = useSemesters();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isResetting, setIsResetting] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    image: "",
    github: "",
    linkedin: "",
    twitter: ""
  });

  // Initialize form when userStats loads
  React.useEffect(() => {
    if (userStats) {
      setProfileForm({
        name: userStats.name || "",
        image: userStats.image || "",
        github: userStats.github || "",
        linkedin: userStats.linkedin || "",
        twitter: userStats.twitter || ""
      });
    }
  }, [userStats]);

  const handleUpdateYear = async (year: BtechYear) => {
    if (!user) return;
    try {
      await statsService.updateUserStats(user.uid, { btechYear: year });
      toast.success(`Year updated to ${getYearLabel(year)}`);
    } catch (error) {
      toast.error("Failed to update year");
    }
  };

  const handleUpdateBranch = async (branch: string) => {
    if (!user) return;
    try {
      await statsService.updateUserStats(user.uid, { branch });
      toast.success(`Branch updated to ${branch}`);
    } catch (error) {
      toast.error("Failed to update branch");
    }
  };

  const handleSetActiveSemester = async (semId: string) => {
    try {
      await semesterService.setActiveSemester(semId);
      toast.success("Active semester updated");
    } catch (error) {
      toast.error("Failed to update active semester");
    }
  };

  const handleCreateAndSetActiveSemester = async (num: number) => {
    try {
      await semesterService.addSemester(num);
      toast.success(`Semester ${num} initialized and set as active`);
    } catch (error) {
      toast.error(`Failed to initialize Semester ${num}`);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      await statsService.updateUserStats(user.uid, {
        name: profileForm.name,
        image: profileForm.image,
        github: profileForm.github,
        linkedin: profileForm.linkedin,
        twitter: profileForm.twitter
      });
      toast.success("Profile details updated successfully");
    } catch (error) {
      toast.error("Failed to update profile details");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const [resetConfirmStep, setResetConfirmStep] = useState(0);

  const handleResetData = async () => {
    if (!user) return;
    
    if (resetConfirmStep < 2) {
      setResetConfirmStep(prev => prev + 1);
      return;
    }
    
    setIsResetting(true);
    const toastId = toast.loading("Initializing data purge...");
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.loading("Revoking all earned XP...", { id: toastId });
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.loading("Wiping academic history...", { id: toastId });
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.loading("Purging semesters and roadmaps...", { id: toastId });
      
      await statsService.resetUserData(user.uid);
      
      toast.success("Profile reset to factory settings", { id: toastId });
      // Force a hard reload to clear all states and re-fetch clean data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error("Data purge failed", { id: toastId });
      setResetConfirmStep(0);
    } finally {
      setIsResetting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-500/50 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LandingPage />
        <Toaster position="top-right" theme="dark" richColors />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-slate-100 selection:bg-amber-500/30 relative">
      {/* Universal Sanctuary Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.03)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(157,78,221,0.02)_0%,_transparent_40%)]" />
        <div className="absolute inset-0 dot-grid opacity-[0.03]" />
      </div>

      {/* Sidebar and Top Nav */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsMobileOpen(false); // Close mobile menu when tab changes
        }} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      <TopNav 
        activeTab={activeTab} 
        isCollapsed={isCollapsed} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Global Grain Overlay */}
      <div className="fixed inset-0 z-[100] pointer-events-none noise-overlay" />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Dynamic Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/5 blur-[150px] rounded-full" />
      </div>
      
      <main className={cn(
        "p-6 pt-24 min-h-screen transition-all duration-300 relative z-10",
        isCollapsed ? "ml-0 lg:ml-16" : "ml-0 lg:ml-60"
      )}>
        <Suspense fallback={
          <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 text-amber-500/20 animate-spin" />
          </div>
        }>
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <PlayerCard />
                    <ActionGrids />
                  </div>
                  <div className="space-y-8">
                    <DailyTargetCard />
                    <StudyInput />
                    <PulseFeed />
                  </div>
                </div>

                {/* Mark Day as Complete Button */}
                <div className="flex justify-center pt-12 pb-20">
                  {!todayLog?.isCompleted ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (!todayLog) {
                          toast.error("Please set a daily target first!");
                          return;
                        }
                        setIsCompletionModalOpen(true);
                      }}
                      className="group relative flex items-center gap-4 px-12 py-6 glass-card text-slate-400 hover:text-amber-100 hover:border-amber-500/30 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <div className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                        <Moon className="w-6 h-6 text-amber-500/60 group-hover:rotate-12 transition-all" />
                      </div>
                      <span className="text-xl font-black uppercase tracking-[0.3em] font-cursive">Finish Day</span>
                    </motion.button>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-4 px-12 py-6 rounded-[32px] bg-green-500/5 border border-green-500/10 text-green-500/40 font-black text-xl uppercase tracking-[0.3em] font-cursive shadow-inner"
                    >
                      <CheckCircle2 className="w-7 h-7" />
                      Day Ended Successfully
                    </motion.div>
                  )}
                </div>

                <DayCompletionModal 
                  isOpen={isCompletionModalOpen}
                  onClose={() => setIsCompletionModalOpen(false)}
                  onComplete={() => {
                    setIsCompletionModalOpen(false);
                    toast.success("Day ended successfully, have a good time!!");
                  }}
                />
              </div>
            )}

            {activeTab === "roadmap" && (
              <div className="space-y-12">
                {roadmaps.length > 0 ? (
                  <RoadmapTab 
                    roadmaps={roadmaps} 
                    onOpenArchitect={() => setIsRoadmapModalOpen(true)} 
                  />
                ) : (
                  <div className="p-12 glass-card text-center space-y-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
                    
                    <div className="relative space-y-6">
                      <div className="inline-flex p-6 bg-amber-500/5 rounded-[40px] border border-amber-500/10 shadow-2xl">
                        <MapIcon className="w-16 h-16 text-amber-500/60" />
                      </div>
                      <div>
                        <h2 className="text-4xl font-black text-slate-100 uppercase tracking-tighter mb-2">Study Roadmap</h2>
                        <p className="text-slate-400 max-w-xl mx-auto font-light leading-relaxed italic">
                          Manage your study plan using AI.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsRoadmapModalOpen(true)}
                        className="px-12 py-5 rounded-[32px] bg-amber-500/20 text-amber-200 border border-amber-500/20 font-black uppercase tracking-[0.2em] hover:bg-amber-500 hover:text-black transition-all text-xl"
                      >
                        Start Now
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
                        {[
                          { icon: Upload, title: "1. Upload Syllabus", desc: "Paste topics or upload your college PDF." },
                          { icon: Calendar, title: "2. Set Timeframe", desc: "Choose days, weeks, or study hours." },
                          { icon: Zap, title: "3. Get Strategy", desc: "AI builds an optimized session map." },
                        ].map((feature, i) => (
                          <div key={i} className="bg-[#0F172A]/40 p-6 rounded-3xl border border-white/5 space-y-3 glass-card">
                            <div className="p-2 w-fit bg-amber-500/5 rounded-xl border border-amber-500/10">
                              <feature.icon className="w-5 h-5 text-amber-500/60" />
                            </div>
                            <h4 className="font-bold text-slate-200 tracking-tight">{feature.title}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-light">{feature.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "syllabus" && (
              <div className="space-y-8">
                <div className="p-6 glass-card shadow-2xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-amber-500/5 text-amber-500/60 border border-amber-500/10">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-100">Syllabus Tracker</h2>
                      <p className="text-sm text-slate-500 font-light">Manage your subjects and chapter mastery</p>
                    </div>
                  </div>
                  <SubjectList />
                </div>
              </div>
            )}

            {activeTab === "focus" && (
              <div className="space-y-8 py-12">
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-3xl font-black text-slate-100 tracking-tight font-cursive">Focus Timer</h2>
                  <p className="inline-flex px-3 bg-amber-500/80 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded py-0.5">Focus now</p>
                </div>
                <PomodoroTimer />
              </div>
            )}

            {activeTab === "progress" && (
              <div className="space-y-12">
                <div className="p-6 glass-card">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-white/5 text-amber-500/60 border border-white/10">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-100">Progress Hub</h2>
                      <p className="text-sm text-slate-500 font-light italic">Track your progress</p>
                    </div>
                  </div>
                  <SemesterDashboard />
                </div>

                <div className="p-6 glass-card">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-white/5 text-purple-400/60 border border-white/10">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-100">Certificates & Internships</h2>
                      <p className="text-sm text-slate-500 font-light italic">Professional milestones</p>
                    </div>
                  </div>
                  <CertificationBoard />
                </div>

                <ProgressChart days={7} />
                <GpaTracker />
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-8">
                <div className="p-6 glass-card">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-white/5 text-amber-400/60 border border-white/10">
                       <History className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-100">Transaction History</h2>
                      <p className="text-sm text-slate-500 font-light italic">A complete log of your study flow</p>
                    </div>
                  </div>
                  <PulseFeed />
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="max-w-2xl mx-auto space-y-8 pb-20">
                {statsLoading ? (
                  <div className="flex items-center justify-center p-20">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 rounded-2xl bg-white/5 text-amber-500/60 border border-white/10">
                        <Settings className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-100 uppercase tracking-widest">Settings</h2>
                        <p className="text-sm text-slate-500 font-light italic">Change your settings</p>
                      </div>
                    </div>

                    {/* Profile Section */}
                    <div className="p-6 glass-card space-y-6">
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                            {profileForm.image ? (
                              <img src={profileForm.image} alt="Profile" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-3xl font-black text-amber-500/40">{(profileForm.name || "BU").substring(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="absolute -bottom-2 -right-2 p-2 bg-amber-500 rounded-xl shadow-lg border-4 border-[#0F172A] opacity-0 group-hover:opacity-100 transition-all">
                            <Upload className="w-4 h-4 text-black" />
                          </div>
                        </div>
                        
                        <div className="flex-1 w-full space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Codename / Name</label>
                            <input 
                              type="text"
                              value={profileForm.name}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Your identity..."
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/30 focus:bg-white/10 transition-all font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Avatar Image URL</label>
                            <input 
                              type="text"
                              value={profileForm.image}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, image: e.target.value }))}
                              placeholder="Paste image link..."
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/30 focus:bg-white/10 transition-all font-mono text-[10px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="p-6 glass-card space-y-6">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-100 tracking-wide">Social Connections</h3>
                        <p className="text-xs text-slate-500 font-light italic">Link your tech profiles</p>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">GitHub</label>
                            <input 
                              type="text"
                              value={profileForm.github}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, github: e.target.value }))}
                              placeholder="username"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500/30 transition-all"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">LinkedIn</label>
                            <input 
                              type="text"
                              value={profileForm.linkedin}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, linkedin: e.target.value }))}
                              placeholder="profile-slug"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500/30 transition-all"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Twitter/X</label>
                            <input 
                              type="text"
                              value={profileForm.twitter}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, twitter: e.target.value }))}
                              placeholder="@handle"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500/30 transition-all"
                            />
                          </div>
                        </div>
                        
                        <button
                          onClick={handleSaveProfile}
                          disabled={isSavingProfile}
                          className="w-full py-4 rounded-2xl bg-amber-500 text-black font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          {isSavingProfile ? "SAVING CHANGES..." : "SAVE PROFILE SETTINGS"}
                        </button>
                      </div>
                    </div>

                    {/* Year Selection */}
                    <div className="p-6 glass-card space-y-6">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-100 tracking-wide">Academic Year</h3>
                        <p className="text-xs text-slate-500 font-light italic">Select your current stage</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.values(BtechYear).map((year) => (
                          <button
                            key={year}
                            onClick={() => handleUpdateYear(year)}
                            className={cn(
                              "py-3 rounded-xl border font-black text-xs transition-all",
                              userStats?.btechYear === year
                                ? "bg-amber-500/20 border-amber-500/20 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                                : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
                            )}
                          >
                            {getYearLabel(year)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Branch Selection */}
                    <div className="p-6 glass-card space-y-6">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-100 tracking-wide">Engineering Branch</h3>
                        <p className="text-xs text-slate-500 font-light italic">Your field of expertize</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {["CSE", "ECE", "ME", "CE", "EE", "IT", "AI/ML", "DS"].map((branch) => (
                          <button
                            key={branch}
                            onClick={() => handleUpdateBranch(branch)}
                            className={cn(
                              "py-3 rounded-xl border font-black text-xs transition-all",
                              userStats?.branch === branch
                                ? "bg-purple-500/20 border-purple-500/20 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                                : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
                            )}
                          >
                            {branch}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Semester Selection */}
                    <div className="p-6 glass-card space-y-6">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-100 tracking-wide">Active Semester</h3>
                        <p className="text-xs text-slate-500 font-light italic">
                          {userStats?.btechYear 
                            ? `Focus session for ${getYearLabel(userStats.btechYear)}` 
                            : "Select your year first"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {userStats?.btechYear ? (
                          YEAR_SEMESTER_MAP[userStats.btechYear].map((num) => {
                            const semester = semesters.find((s) => s.number === num);
                            return semester ? (
                              <button
                                key={semester.id}
                                onClick={() => handleSetActiveSemester(semester.id)}
                                className={cn(
                                  "py-4 rounded-xl border font-black text-xs transition-all relative overflow-hidden group",
                                  semester.isActive
                                    ? "bg-amber-500/20 border-amber-500/20 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                                    : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
                                )}
                              >
                                <span className="relative z-10">Semester {num}</span>
                              </button>
                            ) : (
                              <button
                                key={num}
                                onClick={() => handleCreateAndSetActiveSemester(num)}
                                className="py-4 rounded-xl border border-dashed border-white/10 bg-white/5 text-slate-600 hover:text-amber-500/60 hover:border-amber-500/30 transition-all font-bold text-xs flex flex-col items-center justify-center gap-1"
                              >
                                <span>Initialize Semester {num}</span>
                              </button>
                            );
                          })
                        ) : (
                          <div className="col-span-full py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                            <p className="text-xs text-slate-600 italic">Please select your academic year above</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reset Section */}
                    <div className="p-6 glass-card space-y-6">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-100 tracking-wide uppercase">Danger Zone</h3>
                        <p className="text-xs text-slate-500 font-light italic">Irreversible actions for your profile</p>
                      </div>
                      <button
                        onClick={handleResetData}
                        disabled={isResetting}
                        onMouseLeave={() => !isResetting && setResetConfirmStep(0)}
                        className={cn(
                          "w-full flex items-center justify-center gap-3 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest disabled:opacity-50 group",
                          resetConfirmStep === 0 
                            ? "bg-red-500/5 border border-red-500/10 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20"
                            : resetConfirmStep === 1
                              ? "bg-orange-500/20 border border-orange-500/40 text-orange-500 animate-pulse"
                              : "bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                        )}
                      >
                        <Trash2 className={cn("w-4 h-4 transition-transform", resetConfirmStep > 0 && "rotate-12")} />
                        {isResetting 
                          ? "PURGING DATA..." 
                          : resetConfirmStep === 0 
                            ? "Reset Profile (Delete All Data)" 
                            : resetConfirmStep === 1 
                              ? "Are you absolutely sure?" 
                              : "Final Confirmation: DELETE ALL?"
                        }
                      </button>
                    </div>

                    {/* Logout Section */}
                    <div className="p-6 glass-card space-y-6">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-100 tracking-wide">Account Session</h3>
                        <p className="text-xs text-slate-500 font-light italic">End your study session</p>
                      </div>
                      <button
                        onClick={() => authService.logout()}
                        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-500 hover:text-amber-100 hover:border-amber-500/30 transition-all font-bold text-sm"
                      >
                        <LogOut className="w-5 h-5" />
                        Logout Session
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <RoadmapModal 
          isOpen={isRoadmapModalOpen}
          onClose={() => setIsRoadmapModalOpen(false)}
        />
        <AiBuddyBubble />
      </Suspense>
      <Toaster position="top-right" theme="dark" richColors />
    </div>
  );
}
