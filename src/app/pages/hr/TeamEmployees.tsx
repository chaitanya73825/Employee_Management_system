import React, { useState } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { Users, Search, Mail, Activity, ShieldAlert } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { useSystem } from "../../context/SystemContext";

export default function TeamEmployees() {
  const { user: currentUser } = useAuth();
  const { employees } = useSystem();
  const [searchTerm, setSearchTerm] = useState("");

  const myTeam = employees.filter(e => e.hrId === currentUser?.id);
  const filteredTeam = myTeam.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const activeCount = myTeam.filter(m => m.status === "active").length;
  const leaveCount = myTeam.filter(m => m.status === "leave").length;

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-3 text-slate-800">
            <Users className="text-blue-500" /> My Team <span className="text-blue-500 font-bold">.ROSTER</span>
          </h1>
          <p className="text-slate-500 mt-1">Real-time view of employees assigned to your control node</p>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard blur="lg" className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Team Size</p>
            <p className="text-2xl font-bold text-blue-600">{myTeam.length}/5</p>
          </div>
        </GlassCard>
        <GlassCard blur="lg" className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
            <Activity className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Active Now</p>
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          </div>
        </GlassCard>
        <GlassCard blur="lg" className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center">
            <Users className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">On Leave</p>
            <p className="text-2xl font-bold text-orange-600">{leaveCount}</p>
          </div>
        </GlassCard>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search team member names..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-700 outline-none focus:border-blue-400 focus:shadow-[0_0_12px_rgba(59,130,246,0.15)]"
        />
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeam.map((member) => (
          <GlassCard key={member.id} blur="lg" className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className={cn(
                "w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold",
                member.status === "active"
                  ? "bg-blue-50 border-blue-300 text-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.2)]"
                  : "bg-slate-100 border-slate-300 text-slate-400"
              )}>
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-slate-700">{member.name}</h4>
                <p className="text-xs text-slate-400 uppercase tracking-widest">{member.employeeId || "NEW-EMP"}</p>
              </div>
              <span className={cn(
                "text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold",
                member.status === "active" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
              )}>
                {member.status === "active" ? "Online" : "Off-line"}
              </span>
            </div>
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 italic">Department</span>
                <span className="font-medium text-slate-600">{member.department}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 truncate">
                <Mail className="w-3 h-3" /> {member.employeeId ? `${member.employeeId}@nexus.sys` : `${member.name.toLowerCase().replace(" ", ".")}@nexus.sys`}
              </div>
            </div>
          </GlassCard>
        ))}

        {filteredTeam.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
             <ShieldAlert className="w-8 h-8 opacity-20 mb-2" />
             <p className="text-sm italic">No employees found in your team roster.</p>
          </div>
        )}
      </div>
    </div>
  );
}
