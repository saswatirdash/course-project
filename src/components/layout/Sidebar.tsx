import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  BookOpen, 
  Timer, 
  GraduationCap, 
  Briefcase, 
  History, 
  Settings, 
  LogOut,
  Zap,
  ChevronLeft,
  ChevronRight,
  Map as MapIcon
} from "lucide-react";
import { cn } from "../../lib/utils";
import { authService } from "../../services/authService";
import { useStats } from "../../hooks/useStats";
import { getYearLabel } from "../../lib/stats";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }: SidebarProps) {
  const { userStats } = useStats();

  const navItems = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "roadmap", label: "Plan", icon: MapIcon },
    { id: "syllabus", label: "Subjects", icon: BookOpen },
    { id: "focus", label: "Focus", icon: Timer },
    { id: "progress", label: "Progress Hub", icon: GraduationCap },
    { id: "history", label: "History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const yearColors = {
    FIRST: "border-green-500 text-green-400 shadow-[0_0_8px_#22C55E]",
    SECOND: "border-amber-500 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
    THIRD: "border-purple-500 text-purple-400 shadow-[0_0_8px_#8B5CF6]",
    FOURTH: "border-red-500 text-red-400 shadow-[0_0_8px_#EF4444]",
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-[#050508] border-r border-white/5 transition-all duration-300 z-40 flex flex-col",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <Zap className="w-5 h-5 text-amber-500/80 fill-current" />
          </div>
          {!isCollapsed && (
            <span className="font-mono font-black text-[8px] tracking-[0.1em] bg-amber-500 text-black px-1.5 py-0.5 rounded uppercase whitespace-nowrap">
              BTech Buddies
            </span>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-6 px-2 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
              activeTab === item.id 
                ? "bg-white/5 text-amber-200/90" 
                : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
            )}
          >
            <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-amber-500/80" : "text-slate-600 group-hover:text-slate-400")} />
            {!isCollapsed && <span className="font-medium text-xs tracking-wide">{item.label}</span>}
            {activeTab === item.id && !isCollapsed && (
              <div className="absolute right-2 w-1 h-1 rounded-full bg-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            )}
          </button>
        ))}
      </nav>

      {/* User Profile / Footer */}
      <div className="p-4 border-t border-white/5 space-y-4">
        {!isCollapsed && userStats && (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
              {userStats.image ? (
                <img src={userStats.image} alt={userStats.name} className="w-full h-full object-cover grayscale-[0.2]" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-xs font-bold text-amber-500/60">{userStats.name.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-300 truncate">{userStats.name}</p>
              <span className="inline-flex px-1.5 bg-amber-500/20 text-black text-[8px] font-black uppercase tracking-wider mt-0.5 rounded">
                {getYearLabel(userStats.btechYear)}
              </span>
            </div>
          </div>
        )}

        <button 
          onClick={() => authService.logout()}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#EF4444] hover:bg-red-500/10 transition-colors",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center py-2 text-[#64748B] hover:text-[#94A3B8] transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}
