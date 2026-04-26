import React, { useEffect, useRef, useState } from "react";
import { Zap, BookOpen, Sparkles, Trophy, ShoppingBag, AlertTriangle, LayoutDashboard, LogIn, Cpu, Target, Calculator, ShieldAlert, GraduationCap, Map } from "lucide-react";
import { authService } from "../../services/authService";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const FEATURES = [
  {
    id: "roadmap",
    icon: <Map className="w-6 h-6" />,
    title: "Roadmap Architect",
    desc: "AI-generated subject roadmaps tailored to your curriculum.",
    details: "Enter any subject—from Quantum Physics to Modern History—and our AI builds a step-by-step path to mastery. Complete with time estimates and resource links.",
    color: "#a5f3fc"
  },
  {
    id: "tutor",
    icon: <Cpu className="w-6 h-6" />,
    title: "AI Study Tutor",
    desc: "A 24/7 intellectual partner for your doubts.",
    details: "Stuck on a concept? Ask the tutor built directly into your session. Get structured, readable answers in bullet points or paragraphs with bold key terms.",
    color: "#fda4af"
  },
  {
    id: "hub",
    icon: <GraduationCap className="w-6 h-6" />,
    title: "Semester Hub",
    desc: "Master your GPA and degree progression.",
    details: "Track AGPI, SGPA, and total credits across all semesters. Manage backlogs with a dedicated system to keep your degree on track.",
    color: "#9d4edd"
  },
  {
    id: "shop",
    icon: <ShoppingBag className="w-6 h-6" />,
    title: "XP Rewards",
    desc: "Gamified progress that converts to real rewards.",
    details: "Earn XP for every focus session. Rank up from Beginner to Grandmaster and spend your balance in the shop for guilt-free treats.",
    color: "#a5f3fc"
  },
  {
    id: "focus",
    icon: <Target className="w-6 h-6" />,
    title: "Focus Lab",
    desc: "Deep work sessions with scientific rigor.",
    details: "Integrated Pomodoro timers with daily logs that track your average focus time, total minutes, and session streaks.",
    color: "#fda4af"
  },
  {
    id: "shield",
    icon: <ShieldAlert className="w-6 h-6" />,
    title: "Penalty Protocol",
    desc: "Integrity checks for serious students.",
    details: "Stay honest with our discipline system. Self-punish for distractions to keep your grind authentic and your willpower strong.",
    color: "#9d4edd"
  }
];

export function LandingPage() {
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.1 }
    );

    revealRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const user = await authService.loginWithGoogle();
      if (!user) return;
      toast.success("Welcome back, Buddy!");
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
    }
  };

  const scrollToLogin = () => {
    const loginSection = document.getElementById("login-section");
    loginSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-[#9d4edd]/30 overflow-x-hidden relative">
      {/* Dynamic Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Deep Atmosphere Gradient (Replaces heavy video) */}
        <div className="absolute inset-0 bg-[#050508]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_rgba(157,78,221,0.05)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,_rgba(245,158,11,0.03)_0%,_transparent_50%)]" />

        {/* Ambient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0f]/20 to-[#0a0a0f]" />
        
        {/* Digital Noise / Film Grain (Optimized) */}
        <div className="absolute inset-0 opacity-[0.01] mix-blend-overlay pointer-events-none noise-overlay" />
      </div>

      {/* Warm Lamp Glow (Interactive) */}
      <div className="fixed top-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none z-0 animate-pulse" style={{ animationDuration: '10s' }} />

      {/* Subtle Rain Overlay (CSS) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="rain-container" />
      </div>

      {/* Dot Grid Background */}
      <div className="fixed inset-0 dot-grid opacity-10 pointer-events-none z-0" />

      {/* Section 1: Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center p-6 z-10">
        <div className="space-y-6 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center relative group backdrop-blur-md">
              <Zap className="w-8 h-8 text-amber-200/40 relative z-10 group-hover:text-amber-200 transition-colors" />
              <div className="absolute inset-0 bg-amber-500/5 blur-xl group-hover:bg-amber-500/20 transition-all" />
            </div>
            <div className="text-left">
              <span className="block text-2xl md:text-3xl font-black text-amber-100/90 tracking-tighter uppercase font-mono leading-none">
                btech buddies
              </span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.4em] mt-1 block">
                Sanctuary v2.0
              </span>
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-4xl md:text-7xl font-medium tracking-tight text-slate-100 leading-[1.2]"
          >
            Your Study Hub. <br />
            <span className="text-amber-100 font-cursive text-5xl md:text-8xl capitalize tracking-wide opacity-80">Better.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-base md:text-lg text-slate-300 font-light tracking-[0.25em] uppercase"
          >
            Deep Focus. <span className="text-amber-200/60 lowercase italic tracking-normal">Quiet growth.</span>
          </motion.p>

          <div className="pt-10">
            <button
              onClick={scrollToLogin}
              className="px-8 py-4 bg-white/5 text-amber-100 font-medium italic text-base rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.1)] hover:bg-white/10 hover:scale-105 transition-all flex items-center gap-3 mx-auto group backdrop-blur-md border border-white/10"
            >
              Enter Now
              <span className="group-hover:translate-x-1 transition-transform not-italic text-amber-200/50">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Section 2: How It Works */}
      <section className="relative py-32 px-6 z-10 max-w-6xl mx-auto">
        <h2 className="text-xs font-medium text-center mb-20 uppercase tracking-[0.5em] text-slate-500">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            { icon: <BookOpen />, title: "Focus", desc: "Digital silence. Focused intent.", color: "#fcd34d" },
            { icon: <Sparkles />, title: "Practice", desc: "Building knowledge, brick by brick.", color: "#fbbf24" },
            { icon: <Trophy />, title: "Results", desc: "Mastery leads to choice.", color: "#f59e0b" }
          ].map((step, i) => (
            <div
              key={i}
              ref={(el) => { revealRefs.current[i] = el; }}
              className="reveal flex flex-col items-center text-center space-y-6"
            >
              <div 
                className="w-12 h-12 rounded-2xl bg-white/5 border flex items-center justify-center transition-all duration-1000 group hover:bg-white/10"
                style={{ 
                  borderColor: `${step.color}20`,
                  color: step.color
                }}
              >
                {React.cloneElement(step.icon as React.ReactElement<{ size?: number }>, { size: 20 })}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-slate-200 tracking-tight">{step.title}</h3>
                <p className="text-xs text-slate-400 font-light leading-relaxed max-w-[200px] mx-auto">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Features */}
      <section className="relative py-32 px-6 z-10 max-w-6xl mx-auto space-y-20">
        <div className="text-center space-y-4">
          <h2 className="text-xs font-medium uppercase tracking-[0.5em] text-slate-500">Features</h2>
          <p className="text-slate-400 text-sm font-light">Hover over a feature to see what it does.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.id}
              ref={(el) => { revealRefs.current[i + 3] = el; }}
              onHoverStart={() => setHoveredId(feature.id)}
              onHoverEnd={() => setHoveredId(null)}
              className="reveal relative p-8 rounded-[32px] bg-[#1E293B]/5 border border-slate-800/30 transition-all duration-500 cursor-default backdrop-blur-md group"
              style={{ 
                zIndex: hoveredId === feature.id ? 50 : 1
              }}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(30, 41, 59, 0.4)",
                borderColor: `${feature.color}40`,
                boxShadow: `0 20px 40px -15px ${feature.color}20`
              }}
            >
              <div 
                className="w-12 h-12 rounded-2xl bg-slate-900 border flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110"
                style={{ 
                  borderColor: `${feature.color}40`,
                  color: feature.color,
                  boxShadow: hoveredId === feature.id ? `0 0 20px ${feature.color}40` : 'none'
                }}
              >
                {feature.icon}
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-medium text-slate-200 tracking-tight transition-colors group-hover:text-white">
                  {feature.title}
                </h3>
                
                <p className="text-xs text-slate-500 leading-relaxed font-light transition-opacity group-hover:opacity-100">
                  {feature.desc}
                </p>

                <AnimatePresence>
                  {hoveredId === feature.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden border-t border-slate-800/50 pt-4"
                    >
                      <p className="text-[11px] text-slate-400 font-light leading-relaxed italic">
                        {feature.details}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: feature.color }}>
                        Active Protocol <div className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: feature.color }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 4: Philosophy / Motivation */}
      <section id="philosophy-section" className="relative py-32 px-6 z-10 max-w-5xl mx-auto">
        <div className="text-center space-y-16">
          <h2 className="text-xs font-medium uppercase tracking-[0.5em] text-slate-500">Focus on Growth</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                title: "Improve", 
                desc: "Your career is a canvas. Focus on mastering skills that solve real problems, not just passing exams.",
                accent: "text-cyan-200"
              },
              { 
                title: "Relax", 
                desc: "Success without happiness is empty. We believe in high performance through deep rest and mindfulness.",
                accent: "text-pink-200"
              },
              { 
                title: "Choose", 
                desc: "Every hour of focus is an investment in the freedom to choose the life you want to live.",
                accent: "text-purple-300"
              }
            ].map((item, i) => (
              <div
                key={i}
                ref={(el) => { revealRefs.current[i + 9] = el; }}
                className="reveal space-y-4 group"
              >
                <h3 className={`text-xl font-medium ${item.accent} tracking-tight`}>{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-light italic">
                  "{item.desc}"
                </p>
              </div>
            ))}
          </div>

          <div 
            ref={(el) => { revealRefs.current[12] = el; }}
            className="reveal pt-12"
          >
            <p className="text-2xl md:text-4xl font-cursive text-slate-300 tracking-wide">
              "Your journey is unique. <span className="text-cyan-100">Make it meaningful.</span>"
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Login Card */}
      <section id="login-section" className="relative py-32 px-6 z-10 flex flex-col items-center justify-center min-h-[50vh]">
        <div 
          ref={(el) => { revealRefs.current[13] = el; }}
          className="reveal w-full max-w-sm p-10 rounded-[32px] bg-white/5 border border-amber-500/20 shadow-2xl backdrop-blur-2xl text-center space-y-8"
        >
          <div className="space-y-2">
            <h2 className="text-4xl font-normal text-amber-100 font-cursive opacity-90">Login</h2>
            <p className="text-sm text-slate-400 font-light">Join the study community.</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-4 rounded-xl border border-white/10 bg-white/5 text-amber-100 font-medium text-sm flex items-center justify-center gap-3 hover:bg-white/10 transition-all group"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
            Continue with Google
          </button>

          <p className="text-[10px] text-slate-500 font-light italic">
            Trouble logging in? <br />
            <a href={window.location.href} target="_blank" rel="noopener noreferrer" className="text-amber-500/60 hover:text-amber-500 underline underline-offset-4">Open in a new tab</a>
          </p>

          <p className="text-[10px] text-slate-600 font-medium uppercase tracking-[0.4em]">
            Sanctuary OS v2.0
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-10 text-center text-slate-700 text-xs font-medium uppercase tracking-widest z-10">
        © 2026 BTech Buddies • Built for the Unstoppable
      </footer>
    </div>
  );
}
