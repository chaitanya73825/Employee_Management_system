import React from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { CheckSquare, Clock, Target, PlayCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { useProjects } from "../../context/ProjectContext";
import { useSystem } from "../../context/SystemContext";

const STATUS_CONFIG = {
  "todo": { label: "To Do", color: "text-blue-600", bg: "bg-blue-50" },
  "in-progress": { label: "In Progress", color: "text-purple-600", bg: "bg-purple-50" },
  "pending-approval": { label: "Awaiting Review", color: "text-orange-600", bg: "bg-orange-50" },
  "done": { label: "Done", color: "text-green-600", bg: "bg-green-50" },
};

export default function MyTasks() {
  const { user } = useAuth();
  const { tasks: allTasks, projects, updateTaskStatus } = useProjects();
  const { employees } = useSystem();

  const myTasks = allTasks.filter(t => String(t.assignedEmployeeId) === String(user?.id));

  const todoCount = myTasks.filter(t => t.status === "todo").length;
  const inProgressCount = myTasks.filter(t => t.status === "in-progress").length;
  const doneCount = myTasks.filter(t => t.status === "done").length;

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-3 text-slate-800">
            <CheckSquare className="text-blue-500" /> Distributed Tasks <span className="text-blue-500 font-bold">.EXEC</span>
          </h1>
          <p className="text-slate-500 mt-1">Review and advance active assignments</p>
        </div>
      </header>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard blur="lg" className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">To Do</p>
            <p className="text-2xl font-bold text-blue-600">{todoCount}</p>
          </div>
        </GlassCard>
        <GlassCard blur="lg" className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center">
            <Target className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-bold text-purple-600">{inProgressCount}</p>
          </div>
        </GlassCard>
        <GlassCard blur="lg" className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-bold text-green-600">{doneCount}</p>
          </div>
        </GlassCard>
      </div>

      {/* Task List */}
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence>
          {myTasks.map((task) => {
            const statusCfg = STATUS_CONFIG[task.status];
            const proj = projects.find(p => p.id === task.projectId);
            const emp = employees.find(e => e.id === task.assignedEmployeeId);

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <GlassCard blur="lg" className={cn(
                  "p-5 py-4 border-l-4 hover:shadow-md transition-all",
                  task.priority === "high" ? "border-l-red-500 bg-white" :
                  task.priority === "medium" ? "border-l-orange-500 bg-white" : "border-l-blue-500 bg-white",
                  task.status === "done" ? "opacity-75 bg-slate-50 border-l-slate-300" : ""
                )}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        {proj?.name}
                        {emp && <span className="text-purple-500 bg-purple-50 px-1.5 rounded">Asgn: {emp.name}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <h4 className={cn("font-medium text-lg", task.status === "done" ? "text-slate-500 line-through" : "text-slate-800")}>
                          {task.title}
                        </h4>
                        <span className={cn(
                          "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-semibold border",
                          task.priority === "high" ? "text-red-700 bg-red-50 border-red-200" :
                          task.priority === "medium" ? "text-orange-700 bg-orange-50 border-orange-200" : "text-blue-700 bg-blue-50 border-blue-200"
                        )}>
                          {task.priority} Priority
                        </span>
                      </div>
                    </div>
                    
                    {/* Status Action Buttons */}
                    <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/50">
                       <button
                         onClick={() => updateTaskStatus(task.id, "todo")}
                         disabled={task.status === "todo"}
                         className={cn(
                           "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                           task.status === "todo" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-blue-500 hover:bg-slate-200/50"
                         )}
                       >
                         <Clock className="w-3.5 h-3.5" /> Pending
                       </button>
                       <ChevronRight className="w-3 h-3 text-slate-300" />
                       <button
                         onClick={() => updateTaskStatus(task.id, "in-progress")}
                         disabled={task.status === "in-progress"}
                         className={cn(
                           "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                           task.status === "in-progress" ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-purple-500 hover:bg-slate-200/50"
                         )}
                       >
                         <PlayCircle className="w-3.5 h-3.5" /> Active
                       </button>
                       <ChevronRight className="w-3 h-3 text-slate-300" />
                       <button
                         onClick={() => updateTaskStatus(task.id, "done")}
                         disabled={task.status === "done"}
                         className={cn(
                           "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                           task.status === "done" ? "bg-white text-green-600 shadow-sm" : "text-slate-500 hover:text-green-500 hover:bg-slate-200/50"
                         )}
                       >
                         <CheckCircle2 className="w-3.5 h-3.5" /> Done
                       </button>
                    </div>

                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
          
          {myTasks.length === 0 && (
            <div className="py-20 text-center">
              <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-500">No active assignments</h3>
              <p className="text-slate-400 mt-2">Wait for HR to distribute project tasks.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
