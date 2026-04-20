import React from "react";
import { Clock } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { cn } from "../../lib/utils";
import { useTime } from "../../context/TimeContext";

export function TimeSimulationPanel() {
  const { isSimulationActive, setIsSimulationActive } = useTime();

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsSimulationActive(!isSimulationActive)}
        className={cn(
          "p-3 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border border-slate-200/50 backdrop-blur-md",
          isSimulationActive 
            ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse" 
            : "bg-white/80 text-slate-400 hover:bg-white hover:text-slate-600"
        )}
        title={isSimulationActive ? "Simulation Active (Click to Pause)" : "Simulation Paused (Click to Start)"}
      >
        <Clock className="w-6 h-6" />
      </button>
    </div>
  );
}
