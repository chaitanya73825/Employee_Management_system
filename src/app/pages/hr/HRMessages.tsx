import React, { useState, useEffect, useRef } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlowButton } from "../../components/ui/GlowButton";
import { Send, User, MessageCircle, Loader2, ShieldCheck, Search, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../context/AuthContext";
import { useSystem } from "../../context/SystemContext";
import { api } from "../../lib/api";
import { cn } from "../../lib/utils";

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  createdAt: string;
}

export default function HRMessages() {
  const { user: currentUser } = useAuth();
  const { employees } = useSystem();
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // My assigned employees
  const myEmployees = employees.filter(e => e.hrId === currentUser?.id);
  const filteredEmployees = myEmployees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const selectedEmp = myEmployees.find(e => e.id === selectedEmpId);

  const fetchMessages = async () => {
    if (!currentUser?.id || !selectedEmpId) return;
    try {
      const data = await api.get(`/messages/${currentUser.id}/${selectedEmpId}`);
      setMessages(data);
    } catch (err) {
      console.error("HR fetchMessages Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEmpId) {
      setIsLoading(true);
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedEmpId, currentUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser?.id || !selectedEmpId) return;

    setIsSending(true);
    try {
      await api.post("/messages", {
        sender: currentUser.id,
        receiver: selectedEmpId,
        content: newMessage
      });
      setNewMessage("");
      fetchMessages();
    } catch (err) {
      console.error("HR handleSend Error:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex gap-6 h-[calc(100vh-120px)] max-w-[1400px] mx-auto w-full">
      {/* Employee List Sidebar */}
      <GlassCard blur="lg" className="w-[300px] flex flex-col border-slate-200 overflow-hidden bg-white/40 shadow-xl">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-500" /> Employees
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter names..." 
              className="w-full bg-white/50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-blue-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredEmployees.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No employees assigned to you.
            </div>
          ) : (
            filteredEmployees.map(emp => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmpId(emp.id)}
                className={cn(
                  "w-full p-4 flex items-center gap-3 transition-colors border-b border-slate-100 last:border-0",
                  selectedEmpId === emp.id ? "bg-blue-50/50 border-l-4 border-l-blue-500" : "hover:bg-slate-50"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm">
                  {emp.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-medium text-slate-700 truncate text-sm">{emp.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">{emp.role}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </GlassCard>

      {/* Main Chat Area */}
      <GlassCard blur="xl" className="flex-1 flex flex-col border-slate-200 overflow-hidden bg-white/40 shadow-xl">
        {!selectedEmpId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
            <div className="p-6 bg-slate-50/50 rounded-full border border-dashed border-slate-300">
              <MessageCircle className="w-12 h-12 opacity-20" />
            </div>
            <p>Select an employee from the sidebar to view message history</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 bg-white/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
                  {selectedEmp?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{selectedEmp?.name}</h3>
                  <p className="text-[10px] text-green-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full" /> Channel Active
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Employee Feedback Loop</span>
            </div>

            {/* Chat Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20"
            >
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                  <p className="text-sm">No conversation history yet.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={msg._id}
                    className={cn(
                      "flex flex-col max-w-[80%] gap-1",
                      msg.sender === currentUser?.id ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className={cn(
                      "px-4 py-2 rounded-2xl shadow-sm text-sm",
                      msg.sender === currentUser?.id 
                        ? "bg-blue-600 text-white rounded-tr-none" 
                        : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
                    )}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-slate-400 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/80 border-t border-slate-200">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your response to the employee..."
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isSending}
                />
                <GlowButton 
                  type="submit" 
                  className={cn("px-6", isSending && "opacity-50")} 
                  disabled={isSending || !newMessage.trim()}
                >
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </GlowButton>
              </form>
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
}
