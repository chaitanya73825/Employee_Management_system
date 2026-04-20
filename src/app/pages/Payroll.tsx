import React, { useState, useEffect } from "react";
import { GlassCard } from "../components/ui/GlassCard";
import { GlowButton } from "../components/ui/GlowButton";
import { DollarSign, ArrowUpRight, ArrowDownRight, Activity, Percent, Banknote, ShieldAlert } from "lucide-react";
import { motion, useSpring, useTransform } from "motion/react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn } from "../lib/utils";
import { useProjects } from "../context/ProjectContext";

// Animated Counter Component
function AnimatedCounter({ value, prefix = "", suffix = "", className = "" }: { value: number, prefix?: string, suffix?: string, className?: string }) {
  const springValue = useSpring(0, { bounce: 0, duration: 2000 });
  const displayValue = useTransform(springValue, (current) => 
    `${prefix}${current.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}${suffix}`
  );

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  return <motion.span className={className}>{displayValue}</motion.span>;
}

export default function Payroll() {
  const [selectedCycle, setSelectedCycle] = useState("current-cycle");
  const { finances, projects } = useProjects();
  
  const isProfit = finances.net >= 0;
  const completedProjectsCount = projects.filter(p => p.status === "completed").length;

  return (
    <div className="flex-1 flex flex-col gap-6">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-3 text-slate-800">
            <Banknote className="text-green-500" /> Asset & Revenue <span className="text-green-500 font-bold">.FIN</span>
          </h1>
          <p className="text-slate-500 mt-1">Project earnings and payroll distribution across HR nodes</p>
        </div>
        <div className="flex gap-4">
           {completedProjectsCount > 0 && (
             <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> {completedProjectsCount} Projects Closed
             </div>
           )}
        </div>
      </header>

      {/* Main Financial Overview */}
      <GlassCard 
        blur="xl" 
        glow 
        className={cn(
          "p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between",
          isProfit ? "border-green-200 shadow-[0_0_20px_rgba(34,197,94,0.08)]" : "border-red-200 shadow-[0_0_20px_rgba(239,68,68,0.08)]"
        )}
      >
        <div className="absolute -top-20 -right-20 opacity-[0.03]">
          <DollarSign size={300} />
        </div>
        
        <div className="relative z-10 mb-8 md:mb-0">
           <h2 className="text-slate-500 uppercase tracking-widest text-sm mb-2">Net Allocation (Profit/Loss)</h2>
           <div className={cn(
             "text-6xl md:text-8xl font-light tracking-tighter bg-clip-text text-transparent flex items-baseline",
             isProfit ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-orange-600"
           )}>
             <span className={cn("text-4xl mr-2", isProfit ? "text-green-400" : "text-red-400")}>$</span>
             <AnimatedCounter value={finances.net} />
           </div>
           <div className={cn(
             "mt-4 flex items-center gap-2 text-sm border px-3 py-1.5 rounded-full w-fit",
             isProfit ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50"
           )}>
              <Activity className="w-4 h-4" /> {isProfit ? "System Operating at Profit" : "System Operating at Loss"}
           </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 lg:gap-8 relative z-10">
           {/* Revenue */}
           <div className="flex flex-col items-center">
              <div className="w-24 h-24 lg:w-32 lg:h-32 relative mb-4">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={[{value: 100}]} cx="50%" cy="50%" innerRadius={35} outerRadius={45} dataKey="value" stroke="none">
                       <Cell fill="#3b82f6" />
                     </Pie>
                   </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <ArrowUpRight className="w-5 h-5 text-blue-500 mb-1" />
                 </div>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Project Revenue</p>
              <div className="text-xl font-bold text-blue-600">
                 <AnimatedCounter prefix="+$" value={finances.revenue} />
              </div>
           </div>

           {/* Total Salaries */}
           <div className="flex flex-col items-center">
              <div className="w-24 h-24 lg:w-32 lg:h-32 relative mb-4">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={[{value: 100}]} cx="50%" cy="50%" innerRadius={35} outerRadius={45} dataKey="value" stroke="none">
                       <Cell fill="#f97316" />
                     </Pie>
                   </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <Percent className="w-5 h-5 text-orange-500 mb-1" />
                 </div>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Salaries</p>
              <div className="text-xl font-bold text-orange-500">
                 <AnimatedCounter prefix="-$" value={finances.totalSalaries} />
              </div>
           </div>

           {/* Overtime */}
           <div className="flex flex-col items-center">
              <div className="w-24 h-24 lg:w-32 lg:h-32 relative mb-4">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={[{value: 100}]} cx="50%" cy="50%" innerRadius={35} outerRadius={45} dataKey="value" stroke="none">
                       <Cell fill="#ef4444" />
                     </Pie>
                   </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <ArrowDownRight className="w-5 h-5 text-red-500 mb-1" />
                 </div>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Overtime Paid</p>
              <div className="text-xl font-bold text-red-500">
                 <AnimatedCounter prefix="-$" value={finances.otPaid} />
              </div>
           </div>
        </div>
      </GlassCard>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
         <GlassCard blur="lg" className="p-6">
            <h3 className="text-lg font-medium text-slate-700 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
               Project Financial Summary
            </h3>
            <div className="space-y-4">
               {[
                 { label: "Gross Revenue", val: finances.revenue, col: "text-blue-500" },
                 { label: "Base Employee Salaries", val: -finances.totalSalaries, col: "text-orange-500" },
                 { label: "High-Priority Overtime", val: -finances.otPaid, col: "text-red-500" },
               ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center group cursor-default">
                     <span className="text-slate-500 group-hover:text-slate-700 transition-colors">{item.label}</span>
                     <span className={cn("font-mono text-lg transition-all", item.col)}>
                        {item.val > 0 ? "+$" : "-$"}{Math.abs(item.val).toLocaleString()}
                     </span>
                  </div>
               ))}
               <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
                  <span className="text-slate-800 font-bold uppercase text-sm tracking-wider">Net Allocation</span>
                  <span className={cn("font-mono text-xl font-bold", isProfit ? "text-green-600" : "text-red-600")}>
                     {finances.net >= 0 ? "+$" : "-$"}{Math.abs(finances.net).toLocaleString()}
                  </span>
               </div>
            </div>
         </GlassCard>

         <GlassCard blur="lg" className="p-6 flex flex-col justify-between border-slate-200">
            <div>
               <h3 className="text-lg font-medium text-slate-700 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                  Completed Projects Ledger
               </h3>
               <div className="space-y-3 overflow-y-auto max-h-[200px] custom-scrollbar pr-2">
                 {projects.filter(p => p.status === "completed").map(proj => (
                   <div key={proj.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 transition-colors">
                     <div>
                       <h4 className="text-sm font-semibold text-slate-700">{proj.name}</h4>
                       <p className="text-xs text-slate-400 mt-0.5">Won Bid: ${proj.adminBid?.toLocaleString()}</p>
                     </div>
                     <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Settled</span>
                   </div>
                 ))}
                 {completedProjectsCount === 0 && (
                   <p className="text-sm text-slate-500 text-center py-8">No completed projects to display.</p>
                 )}
               </div>
            </div>
         </GlassCard>
      </div>
    </div>
  );
}
