import React, { useState, useEffect } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlowButton } from "../../components/ui/GlowButton";
import { Calendar, CheckCircle2, Clock, XCircle, Send, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { useLeaves, type LeaveRequest } from "../../context/LeaveContext";
import { useAuth } from "../../context/AuthContext";

const STATUS_STYLES = {
  approved: { label: "Approved", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "text-red-600", bg: "bg-red-50", icon: XCircle },
  pending: { label: "Pending", color: "text-orange-600", bg: "bg-orange-50", icon: Clock },
};

export default function ApplyLeave() {
  const { leaves, applyLeave, fetchUserLeaves, loading } = useLeaves();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    type: "Sick Leave",
    startDate: "",
    endDate: "",
    reason: ""
  });

  useEffect(() => {
    fetchUserLeaves();
  }, [fetchUserLeaves]);

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24)) + 1;
    return days > 0 ? days : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      setError("Please fill all fields");
      return;
    }

    const days = calculateDays(formData.startDate, formData.endDate);
    if (days <= 0) {
      setError("End date must be after start date");
      return;
    }

    if (!user?.hrId) {
      setError("No HR assigned to your account. HR approval is required.");
      return;
    }

    const success = await applyLeave({
      ...formData,
      days,
      hrId: user.hrId
    });

    if (success) {
      setSubmitted(true);
      setFormData({ type: "Sick Leave", startDate: "", endDate: "", reason: "" });
      setTimeout(() => setSubmitted(false), 3000);
    } else {
      setError("Failed to submit request. Please try again.");
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-3 text-slate-800">
            <Calendar className="text-purple-500" /> Apply Leave <span className="text-purple-500 font-bold">.REQ</span>
          </h1>
          <p className="text-slate-500 mt-1">Submit a new leave request and view history</p>
        </div>
        <GlassCard blur="lg" className="px-4 py-2 flex items-center gap-3">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Leave Balance</span>
          <span className="text-xl font-bold text-blue-600">12 days</span>
        </GlassCard>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Form */}
        <GlassCard blur="xl" glow className="p-6 border-purple-200">
          <h3 className="text-lg font-medium text-slate-700 mb-6 flex items-center gap-2">
            <Send className="text-purple-500" /> New Request
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
            <div>
              <label className="block text-sm text-slate-500 mb-2">Leave Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:border-purple-400 focus:shadow-[0_0_12px_rgba(168,85,247,0.15)]"
              >
                <option>Sick Leave</option>
                <option>Vacation</option>
                <option>Personal</option>
                <option>Emergency</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-500 mb-2">Start Date</label>
                <input 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:border-purple-400 focus:shadow-[0_0_12px_rgba(168,85,247,0.15)]" 
                />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-2">End Date</label>
                <input 
                  type="date" 
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:border-purple-400 focus:shadow-[0_0_12px_rgba(168,85,247,0.15)]" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-500 mb-2">Reason</label>
              <textarea
                placeholder="Briefly describe the reason..."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:border-purple-400 focus:shadow-[0_0_12px_rgba(168,85,247,0.15)] h-24 resize-none"
              />
            </div>
            <GlowButton type="submit" variant="accent" className="w-full" disabled={submitted}>
              {submitted ? (
                <><CheckCircle2 className="w-4 h-4" /> Request Submitted!</>
              ) : (
                <><Send className="w-4 h-4" /> Submit Request</>
              )}
            </GlowButton>
          </form>
        </GlassCard>

        {/* Leave History */}
        <GlassCard blur="xl" className="p-6">
          <h3 className="text-lg font-medium text-slate-700 mb-6 flex items-center gap-2">
            <Clock className="text-blue-500" /> Leave History
          </h3>
          <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {leaves.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                <Calendar className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-sm italic">No leave history recorded yet.</p>
              </div>
            ) : (
              leaves.map((req) => {
                const style = STATUS_STYLES[req.status as keyof typeof STATUS_STYLES];
                return (
                  <div key={req.id} className="p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-700">{req.type}</h4>
                        <p className="text-xs text-slate-400">{req.startDate} — {req.endDate}</p>
                      </div>
                      <span className={cn("text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded flex items-center gap-1", style.bg, style.color)}>
                        <style.icon className="w-3 h-3" /> {style.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 italic">"{req.reason}"</p>
                    <div className="mt-2 flex items-center text-[10px] text-slate-400">
                      <Clock className="w-3 h-3 mr-1" /> Requested {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
