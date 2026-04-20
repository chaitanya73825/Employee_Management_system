import React, { useState } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlowButton } from "../../components/ui/GlowButton";
import { Activity, Users, ShieldAlert, Cpu, Network } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ResponsiveContainer, RadialBarChart, RadialBar, Tooltip, PieChart, Pie, Cell } from "recharts";
import { cn } from "../../lib/utils";
import { useSystem } from "../../context/SystemContext";
import { useProjects } from "../../context/ProjectContext";

const DATA_RADIAL = [
  { name: "Active", uv: 75, fill: "#3b82f6" },
  { name: "Leave", uv: 15, fill: "#a855f7" },
  { name: "Away", uv: 10, fill: "#ef4444" },
];

const DATA_PIE = [
  { name: "Engineering", value: 4, color: "#3b82f6" },
  { name: "Design", value: 1, color: "#8b5cf6" },
  { name: "Product", value: 2, color: "#ec4899" },
  { name: "Operations", value: 1, color: "#0ea5e9" },
];

export default function AdminDashboard() {
  const { hrNodes, employees } = useSystem();
  const { tasks, projects, finances, finalizeProject } = useProjects();
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  const pendingProjects = projects.filter(p => p.status === "pending_admin");

  const getHRProgress = (hrId: string) => {
    const team = employees.filter(e => String(e.hrId) === String(hrId));
    const teamIds = new Set(team.map(e => String(e.id)));
    const teamTasks = tasks.filter(t => teamIds.has(String(t.assignedEmployeeId)));
    
    if (teamTasks.length === 0) return 0;
    const completed = teamTasks.filter(t => t.status === "done").length;
    return Math.round((completed / teamTasks.length) * 100);
  };

  const activeEmployees = employees.filter(e => e.status === "active").length;
  const leaveEmployees = employees.filter(e => e.status === "leave").length;

  return (
    <div className="flex-1 flex flex-col gap-8 w-full">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-3 text-slate-800">
            <Cpu className="text-blue-500" /> Command Hub <span className="text-blue-500 font-bold">.SYS</span>
          </h1>
          <p className="text-slate-500 mt-1">System Overview — Real-time Employee Metrics & Distribution</p>
        </div>
        <div className="flex gap-4">
           <GlowButton variant="accent" size="sm">
             <ShieldAlert className="w-4 h-4" /> Override Protocol
           </GlowButton>
        </div>
      </header>      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard blur="lg" glow className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users size={64} />
          </div>
          <p className="text-slate-500 text-sm uppercase tracking-wider mb-2">Total Employees</p>
          <div className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
             {employees.length}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-green-600 font-bold uppercase tracking-widest text-[10px]">
            <Activity className="w-3.5 h-3.5" /> System Optimal
          </div>
        </GlassCard>

        <GlassCard blur="lg" className="p-6 relative overflow-hidden group border-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.08)]">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-purple-500">
            <Network size={64} />
          </div>
          <p className="text-slate-500 text-sm uppercase tracking-wider mb-2">Active HR Nodes</p>
          <div className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-purple-600 bg-clip-text text-transparent">
             {hrNodes.length}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 font-bold uppercase tracking-widest text-[10px]">
             Max Capacity: {hrNodes.length * 5}
          </div>
        </GlassCard>

        <GlassCard blur="lg" className="p-6 relative overflow-hidden group border-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-emerald-500">
            <Activity size={64} />
          </div>
          <p className="text-slate-500 text-sm uppercase tracking-wider mb-2">Revenue Hub</p>
          <div className="text-3xl font-bold text-emerald-600">
             ${finances.net.toLocaleString()} <span className="text-xs text-slate-400 font-normal">NET</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
             <span>Gross: ${finances.revenue.toLocaleString()}</span>
             <span className="text-emerald-500">Global Sync</span>
          </div>
        </GlassCard>

        <GlassCard blur="lg" className="p-6 relative overflow-hidden group border-red-200 shadow-[0_0_12px_rgba(239,68,68,0.08)]">
          <p className="text-slate-500 text-sm uppercase tracking-wider mb-2">Leave Metrics</p>
          <div className="flex gap-4 mt-2">
            <div>
              <div className="text-3xl font-bold text-red-500">{leaveEmployees}</div>
              <div className="text-xs text-slate-400">On Leave</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-500">{activeEmployees}</div>
              <div className="text-xs text-slate-400">Active</div>
            </div>
          </div>
          <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-red-400" style={{ width: `${(leaveEmployees / employees.length) * 100}%` }} />
          </div>
        </GlassCard>
      </div>

      {/* Main Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <GlassCard blur="xl" className="p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Cpu className="text-blue-500" /> Project Review HUB
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {pendingProjects.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-2xl p-8">
                 <ShieldAlert className="w-12 h-12 opacity-10 mb-4" />
                 <p className="text-sm italic">No projects pending final approval.</p>
              </div>
            ) : (
              pendingProjects.map(proj => (
                <div key={proj.id} className="p-4 bg-white/60 border border-slate-100 rounded-xl flex items-center justify-between group hover:shadow-md transition-all">
                  <div>
                    <h4 className="font-bold text-slate-700 uppercase tracking-tight">{proj.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">Value: <span className="font-bold text-emerald-600">${proj.adminBid || proj.estimatedValue}</span> — Assigned: {proj.assignedHR}</p>
                  </div>
                  <GlowButton 
                    variant="primary" 
                    size="sm" 
                    className="h-8 text-[10px]"
                    onClick={() => finalizeProject(proj.id)}
                  >
                    Finalize & Record
                  </GlowButton>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard blur="xl" className="p-6 flex flex-col overflow-hidden">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Network className="text-purple-500" /> HR Node Status (Active)
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {hrNodes.map((node) => {
              const progress = getHRProgress(node.id);
              return (
                <motion.div
                  key={node.id}
                  layout
                  onClick={() => setExpandedNode(expandedNode === node.id ? null : node.id)}
                  className="cursor-pointer"
                >
                  <GlassCard
                    blur="sm"
                    className={cn(
                      "p-4 border-l-4 transition-all duration-300",
                      progress >= 100 ? "border-l-green-500 hover:shadow-[0_4px_15px_rgba(34,197,94,0.1)]" :
                      progress >= 50 ? "border-l-blue-500 hover:shadow-[0_4px_15px_rgba(59,130,246,0.1)]" :
                      "border-l-slate-300 hover:shadow-none"
                    )}
                  >
                    <div className="flex justify-between items-center">
                       <div>
                         <h4 className="font-medium text-slate-700">{node.name}</h4>
                         <p className="text-xs text-slate-400 mt-1">Status: <span className={cn("text-xs", progress >= 100 ? "text-green-500" : progress >= 50 ? "text-blue-500" : "text-slate-400")}>{progress >= 100 ? "Operational" : progress > 0 ? "Advancing" : "Initialized"}</span></p>
                       </div>
                       <div className="text-right">
                          <div className="text-sm font-mono text-slate-600">{progress}% Progress</div>
                          <div className="text-xs text-slate-400">{node.teamSize} Assignees</div>
                       </div>
                    </div>
                    <AnimatePresence>
                      {expandedNode === node.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                           <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                              <div className="flex justify-between items-center text-sm">
                                 <span className="text-slate-500">Rebalance suggested:</span>
                                 <GlowButton size="sm" variant={progress < 20 ? "primary" : "accent"} className="py-1 px-3 text-xs">
                                    {progress >= 100 ? "Archive Node" : "Review Tasks"}
                                 </GlowButton>
                              </div>
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
