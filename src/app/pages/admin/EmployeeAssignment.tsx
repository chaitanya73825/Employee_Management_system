import React, { useState } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlowButton } from "../../components/ui/GlowButton";
import { Users, UserCheck, ArrowRightLeft, Search, Briefcase, AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";
import { useSystem } from "../../context/SystemContext";

export default function EmployeeAssignment() {
  const { employees, hrNodes, assignEmployee, promoteToHR } = useSystem();
  const [searchTerm, setSearchTerm] = useState("");

  const assignedCount = employees.filter(e => e.hrId !== null).length;
  const unassignedCount = employees.filter(e => e.hrId === null).length;

  const totalCapacity = hrNodes.length * 5;
  const systemFull = assignedCount >= totalCapacity;

  const filteredEmployees = employees.filter(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAssign = (empId: string, hrId: string) => {
    // Check target HR capacity
    if (hrId !== "") {
      const targetHrNode = hrNodes.find(hr => hr.id === hrId);
      if (targetHrNode && targetHrNode.teamSize >= 5) {
        alert("Maximum team size reached for this HR (5). Cannot assign more.");
        return;
      }
    }
    assignEmployee(empId, hrId === "" ? null : hrId);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <header className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-3 text-slate-800">
            <UserCheck className="text-blue-500" /> Employee Assignment <span className="text-blue-500 font-bold">.MAP</span>
          </h1>
          <p className="text-slate-500 mt-1">Assign and redistribute employees across HR nodes (Max 5/HR)</p>
        </div>
        <GlowButton variant="accent" size="sm">
          <ArrowRightLeft className="w-4 h-4" /> Auto-Balance
        </GlowButton>
      </header>

      {/* Hiring Trigger Warning */}
      {systemFull && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-start gap-3 shadow-sm">
          <AlertTriangle className="text-orange-500 w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-orange-800 font-medium">Workforce limit reached.</h4>
            <p className="text-orange-600 text-sm mt-1">
              All active HR nodes are at full capacity (5/5). Consider adding a new HR from the HR Management panel to assign the remaining employees.
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard blur="lg" className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Total Employees</p>
            <p className="text-2xl font-bold text-blue-600">{employees.length}</p>
          </div>
        </GlassCard>
        <GlassCard blur="lg" className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Assigned</p>
            <p className="text-2xl font-bold text-green-600">{assignedCount}</p>
          </div>
        </GlassCard>
        <GlassCard blur="lg" className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Unassigned</p>
            <p className="text-2xl font-bold text-orange-600">{unassignedCount}</p>
          </div>
        </GlassCard>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-700 outline-none focus:border-blue-400 focus:shadow-[0_0_12px_rgba(59,130,246,0.15)]"
        />
      </div>

      {/* Employee Table */}
      <GlassCard blur="lg" className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium">Employee</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium">Role</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium">Status</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium">Assigned HR</th>
                <th className="text-right px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-full border flex items-center justify-center text-sm font-bold",
                        emp.status === "active" ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-slate-100 border-slate-200 text-slate-400"
                      )}>
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-medium text-slate-700 block">{emp.name}</span>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{emp.employeeId || "NO-ID"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{emp.role}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      emp.status === "active" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                    )}>
                      {emp.status === "active" ? "Active" : "On Leave"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 outline-none focus:border-blue-400" 
                      value={emp.hrId || ""}
                      onChange={(e) => handleAssign(emp.id, e.target.value)}
                    >
                      <option value="">-- Unassigned --</option>
                      {hrNodes.map(hr => (
                        <option 
                          key={hr.id} 
                          value={hr.id}
                          disabled={hr.id !== emp.hrId && hr.teamSize >= 5}
                        >
                          {hr.name} ({hr.teamSize}/5)
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <GlowButton 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => promoteToHR(emp.id)}
                      className="text-xs text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                    >
                      Promote to HR
                    </GlowButton>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No employees found matching your search.
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
