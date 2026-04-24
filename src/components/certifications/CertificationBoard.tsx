import React, { useState } from "react";
import { Award, Briefcase, Plus, ExternalLink, CheckCircle2, Trash2, Clock, MapPin, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCertifications } from "../../hooks/useCertifications";
import { useInternships } from "../../hooks/useInternships";
import { certificationService } from "../../services/certificationService";
import { internshipService } from "../../services/internshipService";
import { CertStatus, InternshipStatus } from "../../types";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import confetti from "canvas-confetti";

import { useNotifications } from "../../hooks/useNotifications";

export function CertificationBoard() {
  const { certifications } = useCertifications();
  const { internships } = useInternships();
  const { addNotification } = useNotifications();
  const [isAddingCert, setIsAddingCert] = useState(false);
  const [isAddingIntern, setIsAddingIntern] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Certifications Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500/60" />
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono text-xs">Courses</h4>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500/60 text-[10px] font-black font-mono">{certifications.length}</span>
          </div>
          <button 
            onClick={() => setIsAddingCert(true)}
            className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-amber-500/60 hover:bg-white/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {certifications.map(cert => (
            <div key={cert.id}>
              <CertCard cert={cert} />
            </div>
          ))}
          {certifications.length === 0 && (
            <div className="p-8 text-center rounded-2xl border border-dashed border-white/5 glass-card-subtle">
              <Award className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">No courses yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Internships Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-500/60" />
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono text-xs">Internships</h4>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500/60 text-[10px] font-black font-mono">{internships.length}</span>
          </div>
          <button 
            onClick={() => setIsAddingIntern(true)}
            className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-amber-500/60 hover:bg-white/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {internships.map(intern => (
            <div key={intern.id}>
              <InternshipCard internship={intern} />
            </div>
          ))}
          {internships.length === 0 && (
            <div className="p-8 text-center rounded-2xl border border-dashed border-white/5 glass-card-subtle">
              <Briefcase className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">No internships yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Cert Modal */}
      <AnimatePresence>
        {isAddingCert && (
          <AddCertModal onClose={() => setIsAddingCert(false)} />
        )}
        {isAddingIntern && (
          <AddInternshipModal onClose={() => setIsAddingIntern(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function CertCard({ cert }: { cert: any }) {
  const { addNotification } = useNotifications();
  const handleComplete = async () => {
    try {
      await certificationService.completeCertification(cert.id);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#10b981", "#8B5CF6"]
      });
      toast.success("Milestone Finalized! +30 XP Allocated");
      addNotification(
        "Course Completed",
        `Brilliant! You've successfully finished '${cert.title}'.`,
        'success'
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to finalize milestone");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Archive this milestone permanently? XP will be revoked.")) {
      try {
        await certificationService.deleteCertification(cert.id);
        toast.info("Milestone Archived");
      } catch (error: any) {
        toast.error(error.message || "Failed to archive");
      }
    }
  };

  return (
    <div className="p-4 glass-card group hover:border-amber-500/20 transition-all duration-500">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all shadow-inner">
            {cert.provider === "NPTEL" ? "📜" : cert.provider === "Coursera" ? "✨" : "🏅"}
          </div>
          <div>
            <h5 className="text-sm font-bold text-slate-300 group-hover:text-amber-500/80 transition-colors">{cert.title}</h5>
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest font-mono">{cert.provider}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={cn(
            "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border font-mono",
            cert.status === CertStatus.COMPLETED ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500/60" : "bg-amber-500/5 border-amber-500/10 text-amber-500/60"
          )}>
            {cert.status}
          </div>
          {cert.url && (
            <a href={cert.url} target="_blank" rel="noreferrer" className="text-slate-800 hover:text-amber-500/60 transition-colors">
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-slate-800 font-mono">
          <Clock className="w-3 h-3 opacity-50" />
          <span className="opacity-50">INITIATED {new Date(cert.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleDelete}
            className="p-2 rounded-lg bg-black/40 text-slate-800 hover:text-red-400 transition-all opacity-40 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {cert.status !== CertStatus.COMPLETED && (
            <button 
              onClick={handleComplete}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-100/80 text-[9px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all font-mono border border-amber-500/10"
            >
              FINALIZE
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function InternshipCard({ internship }: { internship: any }) {
  const { addNotification } = useNotifications();
  const handleStatusChange = async (status: InternshipStatus) => {
    try {
      await internshipService.updateInternshipStatus(internship.id, status);
      if (status === InternshipStatus.COMPLETED) {
        confetti({
          particleCount: 150,
          spread: 100,
          colors: ["#f59e0b", "#10b981"]
        });
        toast.success("Experiential Rite Complete! +50 XP Awarded");
        addNotification(
          "Internship Complete",
          `Congratulations! Your time at ${internship.company} is successfully documented.`,
          'success'
        );
      } else {
        toast.success(`Manifested to ${status}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Update failed");
    }
  };

  return (
    <div className="p-4 glass-card group hover:border-amber-500/20 transition-all duration-500">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all shadow-inner">
            🏛️
          </div>
          <div>
            <h5 className="text-sm font-bold text-slate-300 group-hover:text-amber-500/80 transition-colors">{internship.company}</h5>
            <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest font-mono">{internship.role}</p>
          </div>
        </div>
        <div className={cn(
          "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border font-mono",
          internship.status === InternshipStatus.COMPLETED ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500/60" : 
          internship.status === InternshipStatus.REJECTED ? "bg-red-500/5 border-red-500/10 text-red-500/60" :
          "bg-amber-500/5 border-amber-500/10 text-amber-500/60"
        )}>
          {internship.status}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 text-[10px] text-slate-700 font-mono uppercase tracking-tighter">
          <MapPin className="w-3 h-3 opacity-50" />
          <span className="opacity-70">{internship.type}</span>
        </div>
        {internship.stipend && (
          <div className="flex items-center gap-2 text-[10px] text-emerald-500/40 font-mono uppercase tracking-tighter">
            <DollarSign className="w-3 h-3" />
            <span>₹{internship.stipend}/mo</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <select 
          value={internship.status}
          onChange={(e) => handleStatusChange(e.target.value as InternshipStatus)}
          className="bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-[10px] font-black text-slate-700 uppercase tracking-widest outline-none font-mono focus:border-amber-500/20 transition-all"
        >
          {Object.values(InternshipStatus).map(s => (
            <option key={s} value={s} className="bg-[#050508]">{s}</option>
          ))}
        </select>
        <button 
          onClick={async () => {
            if (window.confirm("Archive this experience?")) {
              await internshipService.deleteInternship(internship.id);
              toast.info("Experience Archived");
            }
          }}
          className="p-2 rounded-lg bg-black/40 text-slate-800 hover:text-red-400 transition-all opacity-40 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function AddCertModal({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState({ title: "", provider: "NPTEL", url: "" });

  const handleSubmit = async () => {
    try {
      await certificationService.addCertification(data.title, data.provider, data.url);
      onClose();
      toast.success("Milestone Initiated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm glass-card p-8 shadow-2xl space-y-6 bg-[#050508]/90"
      >
        <h3 className="text-xl font-black text-slate-100 text-center uppercase tracking-widest font-cursive">Add Course</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest font-mono">Title</label>
            <input 
              type="text" 
              value={data.title}
              onChange={(e) => setData({...data, title: e.target.value})}
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-300 font-mono outline-none focus:border-amber-500/20 transition-all placeholder:text-slate-800 shadow-inner"
              placeholder="e.g. AI Ethics"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest font-mono">Provider</label>
            <select 
              value={data.provider}
              onChange={(e) => setData({...data, provider: e.target.value})}
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-300 font-mono outline-none focus:border-amber-500/20 transition-all shadow-inner"
            >
              <option value="NPTEL" className="bg-[#050508]">NPTEL</option>
              <option value="Coursera" className="bg-[#050508]">Coursera</option>
              <option value="Udemy" className="bg-[#050508]">Udemy</option>
              <option value="Other" className="bg-[#050508]">Other</option>
            </select>
          </div>
        </div>
        <div className="flex gap-4 pt-4">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-black/40 border border-white/5 text-slate-700 font-black uppercase tracking-widest font-mono text-[10px] hover:text-slate-500 transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="flex-[2] py-3 rounded-xl bg-amber-500/20 text-amber-100/80 border border-amber-500/20 font-black uppercase tracking-[0.2em] font-mono text-[10px] hover:bg-amber-500 hover:text-black transition-all">Save</button>
        </div>
      </motion.div>
    </div>
  );
}

function AddInternshipModal({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState({ company: "", role: "", type: "Remote", stipend: 0 });

  const handleSubmit = async () => {
    try {
      await internshipService.addInternship(data);
      onClose();
      toast.success("Experiential Rite Manifested!");
    } catch (error: any) {
      toast.error(error.message || "Failed to manifest");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm glass-card p-8 shadow-2xl space-y-6 bg-[#050508]/90"
      >
        <h3 className="text-xl font-black text-slate-100 text-center uppercase tracking-widest font-cursive">Add Internship</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest font-mono">Company</label>
            <input 
              type="text" 
              value={data.company}
              onChange={(e) => setData({...data, company: e.target.value})}
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-300 font-mono outline-none focus:border-amber-500/20 transition-all shadow-inner"
              placeholder="e.g. Arclight Labs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest font-mono">Title</label>
            <input 
              type="text" 
              value={data.role}
              onChange={(e) => setData({...data, role: e.target.value})}
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-300 font-mono outline-none focus:border-amber-500/20 transition-all shadow-inner"
              placeholder="e.g. Neural Acolyte"
            />
          </div>
        </div>
        <div className="flex gap-4 pt-4">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-black/40 border border-white/5 text-slate-700 font-black uppercase tracking-widest font-mono text-[10px] hover:text-slate-500 transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="flex-[2] py-3 rounded-xl bg-amber-500/20 text-amber-100/80 border border-amber-500/20 font-black uppercase tracking-[0.2em] font-mono text-[10px] hover:bg-amber-500 hover:text-black transition-all">Save</button>
        </div>
      </motion.div>
    </div>
  );
}
