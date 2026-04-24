import React from "react";
import { LogIn, Sparkles, Zap } from "lucide-react";
import { authService } from "../../services/authService";
import { toast } from "sonner";

export function LoginPage() {
  const handleGoogleLogin = async () => {
    try {
      const user = await authService.loginWithGoogle();
      if (!user) return;
      toast.success("Welcome to the Sanctuary.");
    } catch (error) {
      toast.error("Manifestation failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#0F172A_0%,#050508_100%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full animate-pulse delay-1000" />

      <div className="w-full max-w-md glass-card p-10 shadow-2xl relative z-10 space-y-10 bg-[#050508]/80">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-amber-500/10 rounded-[32px] flex items-center justify-center mx-auto border border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.1)]">
            <Zap className="w-10 h-10 text-amber-500/60" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-100 tracking-widest font-cursive uppercase">Sanctuary</h1>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] font-mono mt-2">Harmonize Your Academic Flow</p>
          </div>
        </div>

        <div className="space-y-6">
          <button 
            onClick={handleGoogleLogin}
            className="w-full py-5 rounded-[24px] bg-white/5 border border-white/5 text-slate-100 font-black text-xs uppercase tracking-[0.2em] font-mono flex items-center justify-center gap-4 hover:bg-white/10 transition-all shadow-xl active:scale-95"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 grayscale contrast-125" />
            Continue with Google
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em] font-mono font-black italic"><span className="bg-[#050508] px-4 text-slate-800">Arc-OS Manifest</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-[24px] bg-black/40 border border-white/5 text-center space-y-2 group hover:border-amber-500/20 transition-all">
              <Sparkles className="w-5 h-5 text-amber-500/40 mx-auto group-hover:scale-110 transition-transform" />
              <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest font-mono">Immersive</p>
            </div>
            <div className="p-5 rounded-[24px] bg-black/40 border border-white/5 text-center space-y-2 group hover:border-emerald-500/20 transition-all">
              <LogIn className="w-5 h-5 text-emerald-500/40 mx-auto group-hover:scale-110 transition-transform" />
              <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest font-mono">Secure</p>
            </div>
          </div>
        </div>

        <p className="text-center text-[9px] text-slate-800 uppercase tracking-widest font-black italic leading-relaxed">
          Through this gate, your focus becomes absolute.
        </p>
      </div>
    </div>
  );
}
