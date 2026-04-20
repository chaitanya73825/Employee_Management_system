import React, { useState } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlowButton } from "../../components/ui/GlowButton";
import { Briefcase, Send, Target, ChevronRight, UserPlus, CheckCircle2 } from "lucide-react";
import { useProjects } from "../../context/ProjectContext";
import { useSystem } from "../../context/SystemContext";
import { cn } from "../../lib/utils";

export default function ActiveProjects() {
  const { projects, tasks, assignProjectToHR, submitProject } = useProjects();
  const { hrNodes } = useSystem();
  const [selectedHRs, setSelectedHRs] = useState<Record<string, string>>({});

  const activeProjects = projects.filter(p => ["won", "in_progress", "ready"].includes(p.status));

  // Determine which HRs are available (not assigned to any active project)
  const busyHRNames = new Set(
    projects
      .filter(p => p.assignedHR && ["in_progress", "ready"].includes(p.status))
      .map(p => p.assignedHR)
  );
  const availableHRs = hrNodes.filter(hr => !busyHRNames.has(hr.name));

  const handleAssign = (projectId: string) => {
    const hr = selectedHRs[projectId];
    if (hr) {
      assignProjectToHR(projectId, hr);
    }
  };

  const calculateProgress = (projectId: string) => {
    const projTasks = tasks.filter(t => t.projectId === projectId);
    if (projTasks.length === 0) return 0;
    const completed = projTasks.filter(t => t.status === "done").length;
    return Math.round((completed / projTasks.length) * 100);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-3 text-slate-800">
            <Target className="text-purple-500" /> Active Projects <span className="text-purple-500 font-bold">.EXEC</span>
          </h1>
          <p className="text-slate-500 mt-1">Assign won contracts to HR and track execution</p>
        </div>
      </header>

      <div className="space-y-6">
        {activeProjects.map(project => {
          const progress = calculateProgress(project.id);
          const isReady = project.status === "ready";
          const projTasks = tasks.filter(t => t.projectId === project.id);
          
          return (
            <GlassCard key={project.id} className={cn(
              "p-6 transition-all",
              isReady ? "border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.15)]" : "border-slate-200"
            )}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-slate-800">{project.name}</h3>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full uppercase tracking-wider font-semibold",
                      project.status === "won" ? "bg-blue-50 text-blue-600" :
                      isReady ? "bg-green-50 text-green-600" : "bg-purple-50 text-purple-600"
                    )}>
                      {project.status === "won" ? "Pending Assignment" : 
                       isReady ? "Ready for Submission" : "In Progress"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                     <p><span className="font-medium text-slate-600">Value:</span> ${project.adminBid?.toLocaleString()}</p>
                     <p><span className="font-medium text-slate-600">Deadline:</span> {new Date(project.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                     {project.assignedHR && (
                       <p className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                         <UserPlus className="w-3 h-3" /> HR: {project.assignedHR}
                       </p>
                     )}
                  </div>

                  {/* Progress Bar (if assigned) */}
                  {project.assignedHR && (
                    <div className="mt-6">
                      <div className="flex justify-between text-xs mb-2">
                         <span className="text-slate-500 font-semibold uppercase tracking-wider">Completion</span>
                         <span className={cn("font-bold text-sm", isReady ? "text-green-600" : "text-purple-600")}>{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                         <div 
                           className={cn("h-full transition-all duration-1000", isReady ? "bg-green-500" : "bg-purple-500")}
                           style={{ width: `${progress}%` }}
                         />
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        {projTasks.filter(t => t.status === "done").length} of {projTasks.length} tasks completed
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 md:flex-col justify-end min-w-[200px]">
                  {!project.assignedHR ? (
                    <div className="space-y-3 w-full">
                      <select
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 outline-none focus:border-blue-400"
                        value={selectedHRs[project.id] || ""}
                        onChange={(e) => setSelectedHRs({...selectedHRs, [project.id]: e.target.value})}
                      >
                        <option value="">-- Assign to HR --</option>
                        {availableHRs.map(hr => (
                          <option key={hr.id} value={hr.name}>{hr.name}</option>
                        ))}
                      </select>
                      <GlowButton 
                        variant="primary" 
                        size="sm" 
                        className="w-full justify-center"
                        onClick={() => handleAssign(project.id)}
                        disabled={!selectedHRs[project.id]}
                      >
                         Assign Project
                      </GlowButton>
                    </div>
                  ) : isReady ? (
                    <GlowButton 
                      variant="accent" 
                      className="w-full justify-center py-4 bg-green-500 hover:bg-green-600 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] border-none text-white"
                      onClick={() => submitProject(project.id)}
                    >
                       <Send className="w-4 h-4 mr-2" /> Submit & Close
                    </GlowButton>
                  ) : (
                    <div className="text-center w-full p-4 bg-slate-50 border border-slate-100 rounded-xl">
                       <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                       <p className="text-sm text-slate-500">Awaiting HR Execution</p>
                    </div>
                  )}
                </div>

              </div>
            </GlassCard>
          );
        })}

        {activeProjects.length === 0 && (
          <div className="py-20 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-500">No active projects</h3>
            <p className="text-slate-400 mt-2">Go to the Bidding section to win new contracts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
