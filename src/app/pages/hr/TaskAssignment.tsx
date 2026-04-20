import React, { useState, useEffect } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlowButton } from "../../components/ui/GlowButton";
import { 
  CheckCircle2, Clock, PlayCircle, Plus, LayoutGrid, 
  Target, Briefcase, ShieldAlert, Check, XCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { useProjects } from "../../context/ProjectContext";
import { useSystem } from "../../context/SystemContext";
import { useAuth } from "../../context/AuthContext";

const COLUMNS = [
  { id: "todo", title: "Pending", icon: Clock, color: "text-blue-600" },
  { id: "in-progress", title: "In Progress", icon: PlayCircle, color: "text-purple-600" },
  { id: "pending-approval", title: "Review Required", icon: ShieldAlert, color: "text-orange-600" },
  { id: "done", title: "Completed", icon: CheckCircle2, color: "text-green-600" },
];

const PREDEFINED_TASKS = [
  "Primary System Architecture",
  "Database Schema Implementation",
  "Module Research & Development",
  "Frontend UI/UX Finalization",
  "Quality Assurance & Bug Fixes"
];

export default function TaskAssignment() {
  const { user: currentUser } = useAuth();
  const { projects, tasks, addTaskToProject, updateTaskStatus } = useProjects();
  const { employees } = useSystem();
  
  // My assigned employees only
  const myEmployees = employees.filter(e => String(e.hrId) === String(currentUser?.id));
  
  // Just show projects that are assigned to THIS HR node by name
  const activeProjects = projects.filter(p => 
    (p.status === "in_progress" || p.status === "ready") && 
    p.assignedHR?.toLowerCase().includes(currentUser?.name.toLowerCase() || "")
  );

  const activeProjectIds = new Set(activeProjects.map(p => String(p.id)));
  const filteredTasks = tasks.filter(t => activeProjectIds.has(String(t.projectId)));

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(activeProjects[0]?.id || "");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  // Auto-select first available options when project changes or tasks update
  useEffect(() => {
    if (!selectedProjectId) return;

    const availableTasks = PREDEFINED_TASKS.filter(task => 
      !tasks.some(t => String(t.projectId) === String(selectedProjectId) && t.title === task)
    );
    const availableEmployees = myEmployees.filter(emp => 
      !tasks.some(t => String(t.projectId) === String(selectedProjectId) && String(t.assignedEmployeeId) === String(emp.id))
    );

    if (availableTasks.length > 0) {
      if (!availableTasks.includes(newTaskTitle)) {
        setNewTaskTitle(availableTasks[0]);
      }
    } else {
      setNewTaskTitle("");
    }

    if (availableEmployees.length > 0) {
      if (!availableEmployees.some(e => e.id === selectedEmployeeId)) {
        setSelectedEmployeeId(availableEmployees[0].id);
      }
    } else {
      setSelectedEmployeeId("");
    }
  }, [selectedProjectId, tasks, myEmployees.length]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !selectedProjectId || !selectedEmployeeId) return;

    addTaskToProject({
      title: newTaskTitle,
      description: "Auto-generated distribution task",
      deadline: "2026-10-10",
      status: "todo",
      priority,
      projectId: selectedProjectId,
      assignedEmployeeId: selectedEmployeeId
    });
  };

  return (
    <div className="flex-1 flex flex-col gap-6 h-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-3 text-slate-800">
            <LayoutGrid className="text-purple-500" /> Task Board <span className="text-purple-500 font-bold">.DISTRIBUTION</span>
          </h1>
          <p className="text-slate-500 mt-1">Breakdown projects and assign to your assigned workforce</p>
        </div>
      </header>

      {/* Task Creation Form */}
      <GlassCard blur="lg" className="p-4 bg-white/50 border-purple-200 shadow-[0_4px_20px_rgba(168,85,247,0.05)]">
         <form onSubmit={handleCreateTask} className="flex flex-wrap items-end gap-4">
           <div className="flex-1 min-w-[200px]">
             <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
               <Briefcase className="w-3 h-3" /> Project Contract
             </label>
             <select 
               value={selectedProjectId}
               onChange={(e) => setSelectedProjectId(e.target.value)}
               className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-purple-400"
             >
                {activeProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                {activeProjects.length === 0 && <option value="">No Active Projects</option>}
             </select>
           </div>
           
           <div className="flex-1 min-w-[200px]">
             <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
               <Target className="w-3 h-3" /> Core Deliverable
             </label>
             <select 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-purple-400"
              >
                 {PREDEFINED_TASKS
                   .filter(task => !tasks.some(t => String(t.projectId) === String(selectedProjectId) && t.title === task))
                   .map(task => (
                     <option key={task} value={task}>{task}</option>
                   ))}
                 {PREDEFINED_TASKS.filter(task => !tasks.some(t => String(t.projectId) === String(selectedProjectId) && t.title === task)).length === 0 && (
                   <option value="">No Deliverables Left</option>
                 )}
              </select>
           </div>

           <div className="w-[150px]">
             <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Assign To</label>
             <select 
               value={selectedEmployeeId}
               onChange={(e) => setSelectedEmployeeId(e.target.value)}
               className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-purple-400"
             >
                {myEmployees
                  .filter(emp => !tasks.some(t => String(t.projectId) === String(selectedProjectId) && String(t.assignedEmployeeId) === String(emp.id)))
                  .map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                {myEmployees.filter(emp => !tasks.some(t => String(t.projectId) === String(selectedProjectId) && String(t.assignedEmployeeId) === String(emp.id))).length === 0 && (
                   <option value="">No Idle Workers</option>
                )}
             </select>
           </div>

           <div className="w-[120px]">
             <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
             <select 
               value={priority}
               onChange={(e) => setPriority(e.target.value as any)}
               className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
             >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
             </select>
           </div>

           <GlowButton type="submit" variant="primary" disabled={activeProjects.length === 0 || !newTaskTitle || !selectedEmployeeId} className="w-[120px] justify-center text-xs font-bold uppercase tracking-widest">
             <Plus className="w-4 h-4 mr-1" /> Assign Task
           </GlowButton>
         </form>
      </GlassCard>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-hidden">
        {COLUMNS.map(col => {
          const columnTasks = filteredTasks.filter(t => t.status === col.id);
          return (
            <GlassCard key={col.id} blur="lg" className="flex flex-col h-full bg-slate-50/60 border-slate-200/80 p-3 rounded-2xl text-sm">
               <div className="flex items-center justify-between mb-4 px-1 text-sm">
                  <h3 className={cn("text-xs font-bold uppercase tracking-widest flex items-center gap-2", col.color)}>
                    <col.icon className="w-4 h-4" /> {col.title}
                  </h3>
                  <span className="bg-slate-100 text-[10px] px-2 py-0.5 rounded-full text-slate-600 font-bold">
                    {columnTasks.length}
                  </span>
               </div>


               <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                 <AnimatePresence>
                   {columnTasks.map(task => {
                     const proj = projects.find(p => String(p.id) === String(task.projectId));
                     const emp = employees.find(e => String(e.id) === String(task.assignedEmployeeId));
                     return (
                       <motion.div
                         key={task.id}
                         layout
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, scale: 0.9 }}
                         className="group"
                       >
                         <GlassCard blur="md" className={cn(
                           "p-3 border-l-4 bg-white relative",
                           task.priority === "high" ? "border-l-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.08)]" :
                           task.priority === "medium" ? "border-l-orange-500 shadow-[0_4px_12px_rgba(249,115,22,0.08)]" : "border-l-blue-500 shadow-[0_4px_12px_rgba(59,130,246,0.08)]"
                         )}>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1 truncate">
                              {proj?.name}
                            </div>
                            <h4 className="font-semibold text-slate-700 text-xs mb-3">{task.title}</h4>
                            
                            {/* HR Review Actions */}
                            {task.status === "pending-approval" && (
                              <div className="flex gap-2 mb-3">
                                <button 
                                  onClick={() => updateTaskStatus(task.id, 'done')}
                                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors shadow-sm"
                                >
                                  <Check className="w-3.5 h-3.5" /> <span className="text-[10px] font-bold uppercase">Approve</span>
                                </button>
                                <button 
                                  onClick={() => updateTaskStatus(task.id, 'in-progress')}
                                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors border border-red-200"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> <span className="text-[10px] font-bold uppercase">Reject</span>
                                </button>
                              </div>
                            )}

                            <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                               <div className="flex items-center gap-2">
                                 <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] text-slate-600 font-bold">
                                   {emp?.name[0] || "U"}
                                 </div>
                                 <span className="text-[10px] text-slate-500 font-medium truncate max-w-[60px]">{emp?.name || "Unassigned"}</span>
                               </div>
                               <span className={cn(
                                 "text-[9px] uppercase tracking-tighter px-1.5 py-0.5 rounded font-bold",
                                 task.priority === "high" ? "text-red-700 bg-red-50" :
                                 task.priority === "medium" ? "text-orange-700 bg-orange-50" : "text-blue-700 bg-blue-50"
                               )}>
                                 {task.priority}
                               </span>
                            </div>
                         </GlassCard>
                       </motion.div>
                     );
                   })}
                 </AnimatePresence>
               </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
