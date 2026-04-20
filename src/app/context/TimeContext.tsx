import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export type SpeedMultiplier = 1 | 60 | 144;

export const SPEED_OPTIONS = [
  { value: 1, label: "Real Time (1x)" },
  { value: 60, label: "1 min = 1 hour (60x)" },
  { value: 144, label: "10 min = 1 day (144x)" },
];

interface TimeContextType {
  simulatedTime: Date;
  isSimulationActive: boolean;
  setIsSimulationActive: (active: boolean) => void;
  timeMultiplier: SpeedMultiplier;
  setTimeMultiplier: (multiplier: SpeedMultiplier) => void;
}

const TimeContext = createContext<TimeContextType | null>(null);

export function TimeProvider({ children }: { children: React.ReactNode }) {
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [timeMultiplier, setTimeMultiplier] = useState<SpeedMultiplier>(60);
  const [simulatedTime, setSimulatedTime] = useState<Date>(new Date());
  
  const lastRealTimeRef = useRef<number>(Date.now());
  const simulatedTimeValueRef = useRef<number>(simulatedTime.getTime());

  useEffect(() => {
    let animationFrameId: number;
    
    const tick = () => {
      const now = Date.now();
      const elapsedReal = now - lastRealTimeRef.current;
      lastRealTimeRef.current = now;

      if (isSimulationActive) {
        simulatedTimeValueRef.current += elapsedReal * timeMultiplier;
        setSimulatedTime(new Date(simulatedTimeValueRef.current));
      }
      
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isSimulationActive, timeMultiplier]);

  // When returning to active from inactive, we need to reset the lastRealTimeRef
  // to avoid jumping time based on the elapsed time while paused.
  useEffect(() => {
    if (isSimulationActive) {
      lastRealTimeRef.current = Date.now();
    }
  }, [isSimulationActive]);

  return (
    <TimeContext.Provider
      value={{
        simulatedTime,
        isSimulationActive,
        setIsSimulationActive,
        timeMultiplier,
        setTimeMultiplier,
      }}
    >
      {children}
    </TimeContext.Provider>
  );
}

export function useTime() {
  const ctx = useContext(TimeContext);
  if (!ctx) throw new Error("useTime must be used within TimeProvider");
  return ctx;
}
