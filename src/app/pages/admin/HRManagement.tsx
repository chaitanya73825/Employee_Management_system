import React, { useState } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlowButton } from "../../components/ui/GlowButton";
import { Users, Network, Activity, UserPlus, Settings, Search } from "lucide-react";
import { cn } from "../../lib/utils";
import { useSystem } from "../../context/SystemContext";
import { useProjects } from "../../context/ProjectContext";

const SECOND_HR_CANDIDATE = {
  id: "hr-2",
  name: "James Park",
  department: "Design",
  email: "james.p@nexus.sys"
};

export default function HRManagement() {
  const { hrNodes, employees, promoteToHR } = useSystem();
  const { tasks } = useProjects();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmp, setSelectedEmp] = useState("");

  const getHRProgress = (hrId: string) => {
    const team = employees.filter(e => String(e.hrId) === String(hrId));
    const teamIds = new Set(team.map(e => String(e.id)));
    const teamTasks = tasks.filter(t => teamIds.has(String(t.assignedEmployeeId)));
    
    if (teamTasks.length === 0) return 0;
    const completed = teamTasks.filter(t => t.status === "done").length;
    return Math.round((completed / teamTasks.length) * 100);
  };

  const avgProgress = hrNodes.length > 0 
    ? Math.round(hrNodes.reduce((acc, hr) => acc + getHRProgress(hr.id), 0) / hrNodes.length)
    : 0;

  const peakProgressCount = hrNodes.filter(hr => getHRProgress(hr.id) >= 100).length;

  const filteredHRs = hrNodes.filter(hr => hr.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-3 text-slate-800">
            <Network className="text-purple-500" /> HR Management <span className="text-purple-500 font-bold">.CTRL</span>
          </h1>
          <p className="text-slate-500 mt-1">Manage HR personnel and progress distribution</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 outline-none focus:border-purple-400"
            value={selectedEmp}
            onChange={(e) => setSelectedEmp(e.target.value)}
          >
            <option value="">-- Select Employee to Promote --</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
          <GlowButton 
            variant="primary" 
            size="sm" 
            onClick={() => {
              if (selectedEmp) {
                promoteToHR(selectedEmp);
                setSelectedEmp("");
              }
            }}
            disabled={!selectedEmp}
            className={!selectedEmp ? "opacity-50 cursor-not-allowed" : ""}
          >
            <UserPlus className="w-4 h-4" /> 
            Promote
          </GlowButton>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total HRs", value: hrNodes.length, color: "text-purple-600", icon: Network },
          { label: "Avg Progress", value: `${avgProgress}%`, color: "text-blue-600", icon: Activity },
          { label: "Peak Progress", value: peakProgressCount, color: "text-red-500", icon: Settings },
          { label: "Total Managed", value: employees.filter(e => e.hrId).length, color: "text-green-600", icon: Users },
        ].map((stat, i) => (
          <GlassCard key={i} blur="lg" className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search HR personnel..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-700 outline-none focus:border-blue-400 focus:shadow-[0_0_12px_rgba(59,130,246,0.15)]"
        />
      </div>

      {/* HR Table */}
      <GlassCard blur="lg" className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium">Name</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium">Department</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium">Team Size (Max 5)</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium">Progress</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium">Status</th>
                <th className="text-right px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHRs.map((hr) => {
                const progress = getHRProgress(hr.id);
                return (
                  <tr key={hr.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-sm font-bold text-purple-600">
                          {hr.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">{hr.name}</p>
                          <p className="text-xs text-slate-400">{hr.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{hr.department}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-slate-700">{hr.teamSize}/5</span>
                      <span className="text-xs text-slate-400 ml-1">members</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              progress >= 100 ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.2)]" : 
                              progress >= 50 ? "bg-blue-500" : "bg-slate-400"
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono text-slate-600">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        progress >= 100 ? "bg-green-50 text-green-600" :
                        progress >= 50 ? "bg-blue-50 text-blue-600" :
                        "bg-slate-100 text-slate-500"
                      )}>
                        {progress >= 100 ? "Operational" : progress > 0 ? "Advancing" : "Initialized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <GlowButton variant="ghost" size="sm" className="text-xs">
                        <Settings className="w-3 h-3" /> Manage
                      </GlowButton>
                    </td>
                  </tr>
                );
              })}
              {filteredHRs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No HR personnel found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
