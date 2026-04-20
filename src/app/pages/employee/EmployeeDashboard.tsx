import React from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlowButton } from "../../components/ui/GlowButton";
import { 
  Zap, Bell, Target, Clock, CheckSquare, 
  Calendar, TrendingUp, Play, CheckCircle2, 
  Loader2, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { useSystem } from "../../context/SystemContext";
import { useProjects } from "../../context/ProjectContext";
import { useNotifications } from "../../context/NotificationContext";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { employees } = useSystem();
  const { tasks, updateTaskStatus } = useProjects();
  const { unreadCount } = useNotifications();

  const currentEmployee = employees.find(e => e.id === user?.id);
  const status = currentEmployee?.status || "active";

  const myTasks = tasks.filter(t => String(t.assignedEmployeeId) === String(user?.id));
  const pendingTasks = myTasks.filter(t => t.status !== "done");
  const completedTasksCount = myTasks.filter(t => t.status === "done").length;

  // Priority Task for Focus
  const focusTask = myTasks.find(t => t.status === "in-progress") || 
                    myTasks.find(t => t.status === "todo") || 
                    myTasks[0] || null;

  const stats = [
    { label: "Tasks Pending", val: pendingTasks.length.toString(), color: "text-orange-600", icon: CheckSquare },
    { label: "Completed", val: completedTasksCount.toString(), color: "text-green-600", icon: TrendingUp },
    { label: "Leave Balance", val: "12 days", color: "text-blue-600", icon: Calendar },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 relative">
      {/* Header & Status */}
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-6">
          <motion.div
            layout
            className={cn(
              "w-20 h-20 rounded-full border-4 flex items-center justify-center text-3xl transition-all duration-500 overflow-hidden bg-white shadow-xl",
              status === "active" ? "border-blue-400" : "border-slate-300 opacity-60 grayscale"
            )}
          >
            <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
          </motion.div>
          <div>
            <h1 className="text-3xl font-light tracking-tight flex items-center gap-3 text-slate-800 uppercase">
              <Zap className={cn(status === "active" ? "text-blue-500" : "text-slate-400")} />
              Operator Deck <span className={cn("font-bold text-blue-500")}>.{user?.name.split(" ")[0]}</span>
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={cn(
                "px-3 py-1 text-[10px] uppercase tracking-widest rounded-full border transition-all duration-300 font-bold",
                status === "active" ? "border-green-400 text-green-600 bg-green-50" : "border-slate-300 text-slate-400 bg-slate-100"
              )}>
                {status === "active" ? "Connected" : "Disconnected"}
              </span>
              {user?.employeeId && (
                <span className="px-3 py-1 text-[10px] uppercase tracking-widest rounded-full border border-slate-200 bg-slate-50 text-slate-500 font-bold">
                  UID: {user.employeeId}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-4 items-center">
           <div className="relative p-3 rounded-full bg-white text-slate-500 border border-slate-200 shadow-sm">
             <Bell className="w-5 h-5" />
             {unreadCount > 0 && (
               <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                 {unreadCount}
               </span>
             )}
           </div>
        </div>
      </header>

      <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1", status === "leave" && "opacity-40 pointer-events-none")}>
        {/* Focus Task */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard blur="xl" glow className="p-6 relative overflow-hidden border-blue-200 bg-white/40 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-slate-500">
              <Target className="text-blue-500 w-4 h-4" /> Operational Focus
            </h2>
            
            {focusTask ? (
              <div className="bg-white/80 rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <span className={cn(
                         "px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest",
                         focusTask.priority === "high" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                       )}>
                         {focusTask.priority} Priority
                       </span>
                       <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest flex items-center gap-1",
                          focusTask.status === "in-progress" ? "bg-purple-50 text-purple-600" : 
                          focusTask.status === "pending-approval" ? "bg-orange-50 text-orange-600" : "bg-slate-100 text-slate-500"
                       )}>
                         {focusTask.status === "in-progress" && <Loader2 className="w-3 h-3 animate-spin" />}
                         {focusTask.status.replace("-", " ")}
                       </span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">{focusTask.title}</h3>
                    <p className="text-slate-500 text-sm mt-1">{focusTask.description || "No detailed briefing provided."}</p>
                    
                    <div className="flex items-center gap-4 mt-6">
                       {focusTask.status === "todo" && (
                         <GlowButton onClick={() => updateTaskStatus(focusTask.id, 'in-progress')} variant="primary" className="px-6 py-2">
                           <Play className="w-4 h-4 mr-2" /> Start Working
                         </GlowButton>
                       )}
                       {focusTask.status === "in-progress" && (
                         <GlowButton onClick={() => updateTaskStatus(focusTask.id, 'pending-approval')} variant="primary" className="px-6 py-2 bg-purple-500 hover:bg-purple-600">
                           <CheckCircle2 className="w-4 h-4 mr-2" /> Submit for Review
                         </GlowButton>
                       )}
                       {focusTask.status === "pending-approval" && (
                         <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-xl text-xs font-bold border border-orange-100">
                            <Clock className="w-4 h-4 animate-pulse" /> Awaiting HR Verification
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="w-32 h-32 relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={[
                            { value: focusTask.status === "done" ? 100 : focusTask.status === "pending-approval" ? 80 : focusTask.status === "in-progress" ? 40 : 0 }, 
                            { value: 100 }
                          ]} 
                          cx="50%" cy="50%" innerRadius={40} outerRadius={50} startAngle={90} endAngle={-270} dataKey="value" stroke="none"
                        >
                          <Cell fill={focusTask.status === "done" ? "#22c55e" : "#3b82f6"} />
                          <Cell fill="#f1f5f9" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center font-bold text-slate-700">
                      <span className="text-xl leading-none">
                        {focusTask.status === "done" ? "100" : focusTask.status === "pending-approval" ? "80" : focusTask.status === "in-progress" ? "40" : "0"}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50/50 p-12 rounded-3xl border border-dashed border-slate-300 text-center text-slate-400">
                Maintain readiness. No active assignments found.
              </div>
            )}
          </GlassCard>

          {/* Detailed Roster */}
          <GlassCard blur="lg" className="p-6">
             <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-slate-500">
               <CheckSquare className="text-slate-400 w-4 h-4" /> Comprehensive Roster
             </h2>
             <div className="space-y-3">
                {myTasks.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 text-sm">Deployment queue is currently empty.</p>
                ) : (
                  myTasks.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl transition-all hover:bg-white hover:shadow-md group">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                          t.status === "done" ? "bg-green-100 text-green-600" : 
                          t.status === "pending-approval" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                        )}>
                          {t.status === "done" ? <CheckCircle2 size={18} /> : 
                           t.status === "pending-approval" ? <AlertCircle size={18} /> : <Clock size={18} />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-700">{t.title}</h4>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{t.status.replace("-", " ")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="text-right hidden sm:block">
                           <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Deadline</p>
                           <p className="text-xs font-mono text-slate-600">{new Date(t.deadline).toLocaleDateString()}</p>
                         </div>
                         {t.status === "todo" && (
                           <button onClick={() => updateTaskStatus(t.id, 'in-progress')} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                             <Play size={18} />
                           </button>
                         )}
                      </div>
                    </div>
                  ))
                )}
             </div>
          </GlassCard>
        </div>

        {/* Quick Stats & Personnel */}
        <div className="space-y-6">
          <GlassCard blur="lg" className="p-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Performance Matrix</h3>
            <div className="space-y-6">
              {stats.map((m, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 text-slate-600 font-medium">
                    <m.icon className="w-4 h-4 text-slate-400" /> {m.label}
                  </div>
                  <span className={cn("font-mono text-xl font-bold", m.color)}>{m.val}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard blur="lg" className="p-6 bg-blue-50/30 border-blue-100">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Company Pulse</h3>
                <TrendingUp className="w-4 h-4 text-blue-400" />
             </div>
             <p className="text-xs text-slate-500 leading-relaxed">
               Your contribution to <span className="font-bold text-slate-700">NexCore Systems</span> is vital. Keep maintaining high operational efficiency.
             </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
