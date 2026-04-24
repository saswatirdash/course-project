import { GoogleGenAI, Type } from "@google/genai";
import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Upload, Send, Loader2, Sparkles, Book, Globe, Lightbulb, FileText, Image as ImageIcon, Trash2, MessageSquare, History, User, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { useStats } from "../../hooks/useStats";
import { toast } from "sonner";
import * as mammoth from "mammoth";

interface AiResponse {
  topic: string;
  referenceBooks: string[];
  onlineResources: string[];
  studyStrategy: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  text?: string;
  response?: AiResponse;
  fileName?: string;
  timestamp: Date;
}

export function AiBuddyBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; data: string; extractedText?: string } | null>(null);
  const [fileContext, setFileContext] = useState<{ name: string; type: string; data: string; extractedText?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { userStats } = useStats();

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAnalyzing]);

  useEffect(() => {
    const handleAnalyzeFile = (e: any) => {
      const file = e.detail.file;
      if (file) {
        setIsOpen(true);
        const reader = new FileReader();
        reader.onload = (event) => {
          setSelectedFile({
            name: file.name,
            type: file.type,
            data: event.target?.result as string
          });
          // Optionally trigger analysis automatically
          // setMessage("Please analyze this study material.");
        };
        reader.readAsDataURL(file);
      }
    };

    window.addEventListener('aiBuddyAnalyzeFile', handleAnalyzeFile);
    return () => window.removeEventListener('aiBuddyAnalyzeFile', handleAnalyzeFile);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Max 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedFile({
        name: file.name,
        type: file.type,
        data: event.target?.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!message.trim() && !selectedFile) return;
    
    const currentMessage = message.trim();
    const currentFile = selectedFile;
    
    setIsAnalyzing(true);
    setMessage("");
    setSelectedFile(null);

    // Add user message to UI
    const newUserMsg: ChatMessage = {
      role: 'user',
      text: currentMessage,
      fileName: currentFile?.name,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, newUserMsg]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const userYear = userStats?.btechYear || "FIRST";

      const isInitialAnalysis = chatMessages.length === 0 && currentFile;

      // Build contents array for multi-turn conversation
      const contents: any[] = chatMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ 
          text: msg.text || (msg.response ? `[ANALYSIS]: Topic: ${msg.response.topic}\nStrategy: ${msg.response.studyStrategy}` : "")
        }]
      }));

      // Current turn parts
      const currentParts: any[] = [];
      if (currentMessage) {
        currentParts.push({ text: currentMessage });
      }

      // Handle file if this is a new upload
      if (currentFile && currentFile.data) {
        const [mimeInfo, base64Data] = currentFile.data.split(",");
        const mimeType = mimeInfo.match(/:(.*?);/)?.[1] || "image/jpeg";
        let extracted = "";

        if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          const arrayBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)).buffer;
          const result = await mammoth.extractRawText({ arrayBuffer });
          extracted = result.value;
          currentParts.push({ text: `[FILE CONTENT - ${currentFile.name}]:\n\n${extracted}` });
        } else if (mimeType === "text/plain") {
          extracted = atob(base64Data);
          currentParts.push({ text: `[FILE CONTENT - ${currentFile.name}]:\n\n${extracted}` });
        } else if (mimeType === "application/pdf" || mimeType.startsWith("image/")) {
          currentParts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          });
        }
        
        setFileContext({ ...currentFile, extractedText: extracted });
      } else if (fileContext && chatMessages.length > 0) {
        // We only need to inject context explicitly if it's not already in history or if we want absolute clarity
        // For simplicity, if we have extracted text, we can append it as context for the question
        if (fileContext.extractedText) {
          currentParts.push({ text: `(Context: Refer to the previously uploaded study material "${fileContext.name}")` });
        }
      }

      contents.push({ role: 'user', parts: currentParts });

      const responseContent = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
        config: {
          systemInstruction: `You are a specialized BTech engineering tutor for a ${userYear} student.
          ${isInitialAnalysis 
            ? "Analyze the provided study material and provide a structured JSON study guide." 
            : "Engage in a helpful Q&A session about the study material. Be concise, expert, and academic. Answer questions based on the context provided in previous messages or the current material."}`,
          responseMimeType: isInitialAnalysis ? "application/json" : "text/plain",
          responseSchema: isInitialAnalysis ? {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              referenceBooks: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Standard textbooks for this topic"
              },
              onlineResources: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "YouTube channels, NPTEL links, or documentation"
              },
              studyStrategy: { 
                type: Type.STRING,
                description: "A concise strategy to master this topic"
              }
            },
            required: ["topic", "referenceBooks", "onlineResources", "studyStrategy"]
          } : undefined
        }
      });

      let modelMsg: ChatMessage;
      if (isInitialAnalysis) {
        const data = JSON.parse(responseContent.text || "{}");
        modelMsg = {
          role: 'model',
          response: data,
          timestamp: new Date()
        };
      } else {
        modelMsg = {
          role: 'model',
          text: responseContent.text,
          timestamp: new Date()
        };
      }
      
      setChatMessages(prev => [...prev, modelMsg]);
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      toast.error("AI Buddy is currently recalibrating. Please try again later.");
      // Remove the last message from UI if it failed
      setChatMessages(prev => prev.slice(0, -1));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      {/* Bubble Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)] z-50 text-black"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        {!isOpen && (
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-[#050508]" 
          />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[360px] h-[520px] glass-card shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-amber-500/5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500/60" />
                <span className="font-black text-slate-100 uppercase tracking-widest text-xs font-cursive">Buddy AI</span>
              </div>
              <div className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500/60 uppercase font-mono">
                Gemini 3 Flash
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-black/20">
              {chatMessages.length === 0 && !isAnalyzing && (
                <div className="text-center space-y-4 mt-10">
                  <motion.button
                    whileHover={{ scale: 1.05, borderColor: "rgba(245, 158, 11, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 bg-black/40 rounded-[32px] flex items-center justify-center mx-auto border border-dashed border-white/5 group transition-all"
                  >
                    <Upload className="w-8 h-8 text-slate-700 group-hover:text-amber-500/60 transition-colors" />
                  </motion.button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                    accept="image/*,.pdf,.docx,.txt"
                  />
                  <div>
                    <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">Digitize Archive</p>
                    <p className="text-slate-600 text-[10px] mt-1 italic font-light">Upload scrolls, notes, or trials</p>
                  </div>
                </div>
              )}

              {chatMessages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col gap-2",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[90%] p-3 rounded-2xl text-xs font-mono tracking-tight leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-amber-500/10 border border-amber-500/20 text-amber-200/80 rounded-tr-none" 
                      : "bg-white/5 border border-white/5 text-slate-300 rounded-tl-none"
                  )}>
                    {msg.role === 'user' && (
                      <div className="flex items-center gap-2 mb-1 opacity-50">
                        <User className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase">Seeker</span>
                      </div>
                    )}
                    {msg.role === 'model' && (
                      <div className="flex items-center gap-2 mb-1 text-amber-500/60">
                        <Bot className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase">Guide</span>
                      </div>
                    )}

                    {msg.fileName && (
                      <div className="mb-2 p-2 rounded-lg bg-black/20 border border-white/5 flex items-center gap-2">
                        <FileText className="w-3 h-3 text-amber-500/60" />
                        <span className="text-[10px] truncate">{msg.fileName}</span>
                      </div>
                    )}

                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}

                    {msg.response && (
                      <div className="space-y-4 pt-1">
                        <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-3 h-3 text-amber-500/40" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Topic</span>
                          </div>
                          <p className="text-slate-200 font-bold">{msg.response.topic}</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-emerald-500/60">
                            <Book className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Scrolls</span>
                          </div>
                          <ul className="space-y-1">
                            {msg.response.referenceBooks.map((book, i) => (
                              <li key={i} className="text-[10px] font-light text-slate-400 pl-3 border-l border-white/5">{book}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-amber-500/60">
                            <Lightbulb className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Rite</span>
                          </div>
                          <p className="text-[10px] font-light text-slate-400 leading-relaxed italic">{msg.response.studyStrategy}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {selectedFile && !isAnalyzing && (
                <div className="p-3 rounded-xl bg-black/40 border border-amber-500/10 flex items-center justify-between group animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 rounded-lg bg-amber-500/5 text-amber-500/60 transition-colors grayscale group-hover:grayscale-0">
                      {selectedFile.type.startsWith('image/') ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-300 truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">Ready to analyze</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedFile(null)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-700 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-4 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-amber-500/20 blur-xl animate-pulse rounded-full" />
                    <Loader2 className="w-6 h-6 text-amber-500/60 animate-spin relative z-10" />
                  </div>
                  <p className="text-slate-600 text-[9px] font-mono tracking-widest animate-pulse">GUIDE IS PONDERING...</p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5 bg-black/40 relative">
              {chatMessages.length > 0 && !isAnalyzing && (
                <button 
                  onClick={() => {
                    setChatMessages([]);
                    setFileContext(null);
                  }}
                  className="absolute -top-10 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/5 rounded-full text-[10px] font-mono text-slate-500 hover:text-amber-500/60 transition-colors flex items-center gap-2 group"
                >
                  <History className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                  Reset Session
                </button>
              )}
              
              <div className="flex items-end gap-2">
                {chatMessages.length > 0 && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-white/5 border border-white/5 rounded-xl text-slate-500 hover:text-amber-500 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileSelect} 
                      className="hidden" 
                      accept="image/*,.pdf,.docx,.txt"
                    />
                  </button>
                )}
                <div className="relative flex-1">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAnalyze();
                      }
                    }}
                    placeholder={chatMessages.length > 0 ? "Ask about the material..." : "Inquire the Sanctuary AI..."}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-300 font-mono focus:border-amber-500/20 outline-none transition-all resize-none pr-10 placeholder:text-slate-800"
                    rows={chatMessages.length > 0 ? 1 : 2}
                  />
                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || (!message.trim() && !selectedFile)}
                    className="absolute right-2 bottom-2 p-2 rounded-lg bg-amber-500/20 text-amber-100 disabled:opacity-20 disabled:grayscale transition-all hover:bg-amber-500 hover:text-black"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
