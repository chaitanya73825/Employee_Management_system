import React, { useState, useEffect } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlowButton } from "../../components/ui/GlowButton";
import { Calendar, Check, X, Clock, CheckCircle2, XCircle, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { useLeaves } from "../../context/LeaveContext";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "text-orange-600", bg: "bg-orange-50", icon: Clock },
  approved: { label: "Approved", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "text-red-600", bg: "bg-red-50", icon: XCircle },
};

export default function LeaveRequests() {
  const { leaves, fetchHRLeaves, updateLeaveStatus, loading } = useLeaves();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  useEffect(() => {
    fetchHRLeaves();
  }, [fetchHRLeaves]);

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    await updateLeaveStatus(id, action);
  };

  const filtered = filter === "all" ? leaves : leaves.filter(r => r.status === filter);
  const pendingCount = leaves.filter(r => r.status === "pending").length;

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-3 text-slate-800">
            <Calendar className="text-orange-500" /> Leave Requests <span className="text-orange-500 font-bold">.MGR</span>
          </h1>
          <p className="text-slate-500 mt-1">Review and manage team leave requests</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-600">{pendingCount} pending</span>
          </div>
        )}
      </header>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
        {(["all", "pending", "approved", "rejected"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "px-4 py-2 text-sm rounded-lg transition-all duration-300 capitalize relative z-10",
              filter === tab ? "text-slate-900 bg-white shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 text-slate-400 italic"
            >
              No {filter !== 'all' ? filter : ''} requests found.
            </motion.div>
          ) : (
            filtered.map((req) => {
              const statusCfg = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG];
              return (
                <motion.div
                  key={req.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <GlassCard blur="lg" className={cn(
                    "p-5 border-l-4 transition-all",
                    req.status === "pending" ? "border-l-orange-500 shadow-lg shadow-orange-500/5" :
                    req.status === "approved" ? "border-l-green-500" : "border-l-red-500"
                  )}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-sm font-bold text-blue-600">
                            {req.userName?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-700">{req.userName || "Unknown User"}</h4>
                            <p className="text-xs text-slate-400 underline decoration-blue-100">{req.type}</p>
                          </div>
                          <span className={cn("text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded flex items-center gap-1 ml-auto sm:ml-0", statusCfg.bg, statusCfg.color)}>
                            <statusCfg.icon className="w-3 h-3" /> {statusCfg.label}
                          </span>
                        </div>
                        <div className="ml-12 space-y-2 mt-2">
                          <p className="text-sm text-slate-600 flex items-center gap-2 bg-slate-50 w-fit px-2 py-1 rounded-lg">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" /> {req.startDate} to {req.endDate} 
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-200/50 px-1.5 rounded">{req.days} days</span>
                          </p>
                          <p className="text-sm text-slate-500 leading-relaxed italic border-l-2 border-slate-100 pl-3">"{req.reason}"</p>
                        </div>
                      </div>
                      {req.status === "pending" && (
                        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                          <GlowButton
                            size="sm"
                            variant="danger"
                            onClick={() => handleAction(req.id, "rejected")}
                          >
                            <X className="w-4 h-4" /> Reject
                          </GlowButton>
                          <GlowButton
                            size="sm"
                            variant="primary"
                            onClick={() => handleAction(req.id, "approved")}
                          >
                            <Check className="w-4 h-4" /> Approve
                          </GlowButton>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
