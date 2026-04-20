import React, { useState, useEffect, useRef } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlowButton } from "../../components/ui/GlowButton";
import { GlowInput } from "../../components/ui/GlowInput";
import { Send, User, MessageSquare, Loader2, ShieldCheck } from "lucide-react";
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

export default function MyHR() {
  const { user } = useAuth();
  const { hrNodes, employees } = useSystem();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync hrId: Try AuthContext first, then fallback to current System roster profile
  const currentProfile = employees.find(e => e.id === user?.id);
  const effectiveHrId = user?.hrId || currentProfile?.hrId;

  const myHR = hrNodes.find(hr => hr.id === effectiveHrId);

  const fetchMessages = async () => {
    if (!user?.id || !effectiveHrId) return;
    try {
      const data = await api.get(`/messages/${user.id}/${effectiveHrId}`);
      setMessages(data);
    } catch (err) {
      console.error("Fetch Messages Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [user, effectiveHrId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.id || !effectiveHrId) return;

    setIsSending(true);
    try {
      await api.post("/messages", {
        sender: user?.id,
        receiver: effectiveHrId,
        content: newMessage
      });
      setNewMessage("");
      fetchMessages();
    } catch (err) {
      console.error("Send Message Error:", err);
      alert(`Failed to send: ${(err as any).message || "Server error"}`);
    } finally {
      setIsSending(false);
    }
  };

  if (!effectiveHrId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-700">No HR Assigned</h2>
        <p className="text-slate-500 max-w-md mt-2">
          You haven't been assigned to an HR node yet. Please contact your system administrator to get started. 
          Refreshing after being assigned may be required.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-5xl mx-auto w-full h-[calc(100vh-120px)]">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
            {myHR?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{myHR?.name}</h1>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> 
              Assigned HR Representative
            </p>
          </div>
        </div>
        <GlassCard blur="sm" className="px-4 py-2 border-slate-200 text-xs font-medium text-slate-500 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Secure Channel Active
        </GlassCard>
      </header>

      <GlassCard blur="xl" className="flex-1 flex flex-col overflow-hidden border-slate-200 shadow-xl bg-white/40">
        {/* Chat Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
        >
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="p-4 bg-slate-50 rounded-full">
                <MessageSquare className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-sm">No conversation history yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={msg._id}
                className={cn(
                  "flex flex-col max-w-[80%] gap-1",
                  msg.sender === user.id ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "px-4 py-2 rounded-2xl shadow-sm text-sm",
                  msg.sender === user.id 
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
        <div className="p-4 bg-slate-50/50 border-t border-slate-200">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message to HR..."
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isSending}
            />
            <GlowButton 
              type="submit" 
              className={cn("px-4", isSending && "opacity-50")} 
              disabled={isSending || !newMessage.trim()}
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </GlowButton>
          </form>
        </div>
      </GlassCard>
    </div>
  );
}
