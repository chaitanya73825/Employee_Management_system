import React, { useState } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlowButton } from "../../components/ui/GlowButton";
import { Briefcase, Gavel, FileText, CheckCircle2, TrendingUp, AlertCircle, Bot } from "lucide-react";
import { useProjects } from "../../context/ProjectContext";
import { cn } from "../../lib/utils";

export default function Bidding() {
  const { projects, bidOnProject } = useProjects();
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});
  const [biddingResults, setBiddingResults] = useState<Record<string, { won: boolean; botBids: number[] }>>({});

  const availableProjects = projects.filter(p => p.status === "available" || p.status === "won");

  const handleBid = (projectId: string) => {
    const amount = parseInt(bidAmounts[projectId] || "0", 10);
    if (amount <= 0) return;

    const won = bidOnProject(projectId, amount);
    // Clear input on rejection so they can type a new one easily
    if (!won) {
       setBidAmounts({...bidAmounts, [projectId]: ""});
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-3 text-slate-800">
            <Gavel className="text-blue-500" /> Contract Bidding <span className="text-blue-500 font-bold">.BID</span>
          </h1>
          <p className="text-slate-500 mt-1">Submit competitive bids against AI agents to win project contracts</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableProjects.map(project => {
          const isWon = project.status === "won";
          return (
            <GlassCard key={project.id} blur="xl" className={cn(
              "p-6 flex flex-col transition-all",
              isWon ? "border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]" : "hover:border-blue-300"
            )}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isWon ? "bg-green-100 text-green-600" : "bg-blue-50 text-blue-500"
                  )}>
                    {isWon ? <CheckCircle2 className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Est. Value</p>
                  <p className="text-xl font-bold text-slate-700">${project.estimatedValue.toLocaleString()}</p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-1">{project.name}</h3>
              <p className="text-sm text-slate-500 flex items-center gap-2 mb-6">
                <FileText className="w-4 h-4" /> Deadline: {new Date(project.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>

              {isWon ? (
                <div className="mt-auto bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="font-semibold text-green-700 mb-1">Contract Secured!</p>
                  <p className="text-sm text-green-600 mb-3">Winning bid: ${project.adminBid?.toLocaleString()}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 border-t border-green-200/50 pt-2">
                    <Bot className="w-4 h-4" /> Bot lowest bid: ${Math.min(...(project.botBids || [])).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="mt-auto space-y-4">
                  {project.bidAttempts > 0 && project.botBids && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-2">
                       <p className="font-semibold mb-1">Bid Rejected</p>
                       <p className="text-xs">
                         Your bid: ${project.adminBid?.toLocaleString()}<br/>
                         Competitor won at: <span className="font-bold">${Math.min(...project.botBids).toLocaleString()}</span>
                       </p>
                       <p className="text-xs font-semibold mt-2 border-t border-red-200 pt-2 text-red-700">
                         {3 - project.bidAttempts} attempt(s) remaining. Try again!
                       </p>
                    </div>
                  )}
                  {project.bidAttempts < 3 && (
                    <div>
                      <div>
                         <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block flex justify-between">
                            Your Bid Amount ($)
                            {project.bidAttempts === 0 && <span className="text-blue-500">3 Attempts</span>}
                         </label>
                         <input 
                           type="number" 
                           value={bidAmounts[project.id] || ""}
                           onChange={e => setBidAmounts({...bidAmounts, [project.id]: e.target.value})}
                           placeholder="e.g. 42000"
                           className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-700 outline-none focus:border-blue-400 focus:shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                         />
                      </div>
                      <GlowButton onClick={() => handleBid(project.id)} variant="primary" className="w-full justify-center mt-4">
                        Submit Proposal
                      </GlowButton>
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          );
        })}

        {availableProjects.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-500">No new contracts available</h3>
            <p className="text-slate-400 mt-2">Check your Active Projects dashboard to assign won contracts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
