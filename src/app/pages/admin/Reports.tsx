import React from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { BarChart3, TrendingUp, Users, Clock, Calendar } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { cn } from "../../lib/utils";

const DEPT_DATA: any[] = [];
const MONTHLY_LEAVE: any[] = [];

export default function Reports() {
  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-3 text-slate-800">
            <BarChart3 className="text-blue-500" /> Reports <span className="text-blue-500 font-bold">.ANALYTICS</span>
          </h1>
          <p className="text-slate-500 mt-1">System-wide analytics and performance metrics</p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Active Employees", value: "0", delta: "0%", color: "text-blue-600", icon: Users },
          { label: "Pending Leaves", value: "0", delta: "0%", color: "text-orange-500", icon: Calendar },
          { label: "Avg Task Time", value: "0h", delta: "0h", color: "text-purple-600", icon: Clock },
        ].map((kpi, i) => (
          <GlassCard key={i} blur="lg" className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-400 uppercase tracking-wider">{kpi.label}</p>
              <kpi.icon className={cn("w-4 h-4", kpi.color)} />
            </div>
            <p className={cn("text-3xl font-bold", kpi.color)}>{kpi.value}</p>
            <p className="text-xs text-slate-400 mt-2">No change from last month</p>
          </GlassCard>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Pie */}
        <GlassCard blur="xl" className="p-6 h-[400px] flex flex-col">
          <h3 className="text-lg font-medium text-slate-700 mb-4 flex items-center gap-2">
            <Users className="text-blue-500" /> Department Distribution
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
             <Users className="w-8 h-8 opacity-20 mb-2" />
             <p className="text-sm italic">No distribution data available.</p>
          </div>
        </GlassCard>

        {/* Leave Trends Bar */}
        <GlassCard blur="xl" className="p-6 h-[400px] flex flex-col">
          <h3 className="text-lg font-medium text-slate-700 mb-4 flex items-center gap-2">
            <Calendar className="text-orange-500" /> Leave Trends
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
             <BarChart3 className="w-8 h-8 opacity-20 mb-2" />
             <p className="text-sm italic">No trend data available.</p>
          </div>
        </GlassCard>
      </div>

    </div>
  );
}
