import React from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlowButton } from "../../components/ui/GlowButton";
import { LayoutGrid, Users, CheckCircle2, Clock, Calendar, AlertTriangle, Target, Briefcase } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { useSystem } from "../../context/SystemContext";
import { useProjects } from "../../context/ProjectContext";

export default function HRDashboard() {
  const { user: currentUser } = useAuth();
  const { employees } = useSystem();
  const { projects, tasks, submitProject } = useProjects();

  const myEmployees = employees.filter(e => e.hrId === currentUser?.id);
  
  // Filter projects by assigned HR name
  const myProjects = projects.filter(p => 
    (p.status === "in_progress" || p.status === "ready") && 
    p.assignedHR === currentUser?.name
  );

  const myProjectIds = new Set(myProjects.map(p => p.id));
  const myTasks = tasks.filter(t => myProjectIds.has(t.projectId));
  const completedTasks = myTasks.filter(t => t.status === "done").length;
  const pendingTasksCount = myTasks.length - completedTasks;

  const stats = [
    { label: "My Team", value: myEmployees.length.toString(), color: "text-blue-600", icon: Users },
    { label: "Active Tasks", value: pendingTasksCount.toString(), color: "text-purple-600", icon: Target },
    { label: "Pending Leaves", value: "0", color: "text-orange-500", icon: Calendar },
    { label: "Completion Rate", value: myTasks.length > 0 ? `${Math.round((completedTasks / myTasks.length) * 100)}%` : "0%", color: "text-green-600", icon: CheckCircle2 },
  ];

  const calculateProjectProgress = (projectId: string) => {
    const projTasks = tasks.filter(t => t.projectId === projectId);
    if (projTasks.length === 0) return 0;
    const done = projTasks.filter(t => t.status === "done").length;
    return Math.round((done / projTasks.length) * 100);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-3 text-slate-800">
            <LayoutGrid className="text-purple-500" /> Team Overview <span className="text-purple-500 font-bold uppercase">{currentUser?.name?.split(' ')[0]}.EMS</span>
          </h1>
          <p className="text-slate-500 mt-1">Real-time performance metrics for your assigned team</p>
        </div>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <GlassCard key={i} blur="lg" glow={i === 0} className="p-5 relative overflow-hidden group border-slate-200 shadow-sm bg-white/40">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon size={48} />
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">{stat.label}</p>
            <p className={cn("text-4xl font-bold", stat.color)}>{stat.value}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Project Tracking */}
        <GlassCard blur="xl" className="lg:col-span-2 p-6 flex flex-col border-slate-200 shadow-lg bg-white/40">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Briefcase className="text-blue-500" /> My Assigned Projects
            </h3>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">Execution Mode</span>
          </div>

          <div className="flex-1 space-y-4">
            {myProjects.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                <Briefcase className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-sm italic">No projects assigned to you yet.</p>
              </div>
            ) : (
              myProjects.map(proj => {
                const progress = calculateProjectProgress(proj.id);
                const isReady = progress === 100 && proj.status === "in_progress";

                return (
                  <div key={proj.id} className="p-4 bg-white/60 border border-slate-100 rounded-xl hover:shadow-md transition-all group relative">
                    <div className="flex items-center justify-between mb-3">
                       <h4 className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{proj.name}</h4>
                       <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-500">{progress}%</span>
                        {isReady && (
                          <GlowButton 
                            variant="primary" 
                            size="sm" 
                            className="h-7 text-[10px] px-3"
                            onClick={() => submitProject(proj.id)}
                          >
                            Submit for Review
                          </GlowButton>
                        )}
                       </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                       <div className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        progress === 100 ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" : "bg-blue-500"
                       )} style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                       <span>{tasks.filter(t => t.projectId === proj.id).length} Total Tasks</span>
                       <span>Due: {new Date(proj.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </GlassCard>

        {/* Status / Alerts */}
        <GlassCard blur="xl" className="p-6 flex flex-col border-slate-200 shadow-lg bg-white/40">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" /> System Alerts
          </h3>
          <div className="space-y-4">
             {myProjects.some(p => new Date(p.deadline).getTime() < Date.now() + (7 * 24 * 60 * 60 * 1000)) ? (
               <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs flex items-start gap-2">
                 <Clock className="w-4 h-4 mt-0.5" />
                 <div><p className="font-bold">Deadline Warning</p><p className="opacity-80">You have projects nearing target dates.</p></div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 gap-3 border border-dashed border-slate-200 rounded-xl">
                 <CheckCircle2 className="w-8 h-8 opacity-10" />
                 <p className="text-xs">All systems healthy. No blocking alerts.</p>
               </div>
             )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
