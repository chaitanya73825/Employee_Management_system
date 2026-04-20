import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useTime } from "./TimeContext";
import { useSystem } from "./SystemContext";
import { api } from "../lib/api";

export interface Project {
  id: string;
  name: string;
  estimatedValue: number;
  deadline: string;
  status: "available" | "won" | "in_progress" | "pending_admin" | "ready" | "completed";
  assignedHR: string | null;
  botBids?: number[];
  adminBid?: number;
  bidAttempts: number;
  guaranteedWinAttempt: number;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  deadline: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "pending-approval" | "done";
  assignedEmployeeId: string | null;
}

export interface FinanceSummary {
  revenue: number;
  totalSalaries: number;
  otPaid: number;
  net: number;
}

interface ProjectContextType {
  projects: Project[];
  tasks: ProjectTask[];
  finances: FinanceSummary;
  bidOnProject: (projectId: string, amount: number) => boolean;
  assignProjectToHR: (projectId: string, hrName: string) => void;
  addTaskToProject: (task: Omit<ProjectTask, "id">) => void;
  updateTaskStatus: (taskId: string, status: ProjectTask["status"]) => void;
  submitProject: (projectId: string) => void;
  finalizeProject: (projectId: string) => Promise<void>;
}

const INITIAL_FINANCES: FinanceSummary = {
  revenue: 0,
  totalSalaries: 0,
  otPaid: 0,
  net: 0,
};

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [finances, setFinances] = useState<FinanceSummary>(INITIAL_FINANCES);
  const { simulatedTime } = useTime();
  const { employees } = useSystem();
  
  const lastPayrollRef = useRef(simulatedTime.getTime());
  const lastTaskUpdateRef = useRef(simulatedTime.getTime());

  const fetchAllData = async () => {
    try {
      const [pData, tData, fData] = await Promise.all([
        api.get("/projects").catch(() => []),
        api.get("/tasks").catch(() => []),
        api.get("/finances").catch(() => ({}))]
      );
      setProjects(pData.map((p: any) => ({ ...p, id: p._id })));
      setTasks(tData.map((t: any) => ({ ...t, id: t._id })));
      setFinances(fData);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Poll every 10 seconds for real-time status updates across modes
    const interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const now = simulatedTime.getTime();
    
    // PAYROLL CALCULATION (Monthly)
    const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
    if (now - lastPayrollRef.current >= oneMonthMs) {
      const monthsPassed = Math.floor((now - lastPayrollRef.current) / oneMonthMs);
      lastPayrollRef.current += monthsPassed * oneMonthMs;
      
      const activeCount = employees.filter(e => e.status === "active").length;
      const salaryCost = activeCount * 1500 * monthsPassed;
      
      setFinances(prev => ({
        ...prev,
        totalSalaries: prev.totalSalaries + salaryCost,
        net: prev.net - salaryCost
      }));
    }

    // TASK / PROJECT PROGRESS (Daily simulation)
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (now - lastTaskUpdateRef.current >= oneDayMs) {
       const daysPassed = Math.floor((now - lastTaskUpdateRef.current) / oneDayMs);
       lastTaskUpdateRef.current += daysPassed * oneDayMs;

       setTasks(prev => {
         let changed = false;
         const updated = prev.map(t => {
           if (t.assignedEmployeeId && t.status !== "done" && t.status !== "pending-approval") {
             for (let i = 0; i < daysPassed; i++) {
               if (t.status === "todo" && Math.random() < 0.4) {
                 changed = true;
                 const newStatus = "in-progress" as const;
                 syncTaskUpdate(t.id, newStatus);
                 return { ...t, status: newStatus };
               } else if (t.status === "in-progress" && Math.random() < 0.2) {
                 changed = true;
                 const newStatus = "pending-approval" as const;
                 syncTaskUpdate(t.id, newStatus);
                 return { ...t, status: newStatus };
               }
             }
           }
           return t;
         });
         return changed ? updated : prev;
       });
    }
  }, [simulatedTime, employees]);

  const syncTaskUpdate = async (taskId: string, status: string) => {
    await api.put(`/tasks/${taskId}`, { status });
  };

  const simulateBotBids = (value: number) => {
    const bot1 = Math.round(value * (0.7 + Math.random() * 0.4));
    const bot2 = Math.round(value * (0.7 + Math.random() * 0.4));
    const bot3 = Math.round(value * (0.7 + Math.random() * 0.4));
    return [bot1, bot2, bot3];
  };

  const bidOnProject = (projectId: string, amount: number) => {
    const targetProject = projects.find(p => p.id === projectId);
    if (!targetProject || targetProject.status !== "available") return false;

    const attempts = targetProject.bidAttempts + 1;
    let bots = simulateBotBids(targetProject.estimatedValue);
    let lowestBot = Math.min(...bots);
    
    let isWin = false;
    if (amount <= lowestBot) {
      isWin = true;
    } else if (attempts === targetProject.guaranteedWinAttempt) {
      isWin = true;
      bots = [amount + 1000, amount + 2000, amount + 3000];
    }

    const updateData = isWin 
      ? { status: "won", adminBid: amount, botBids: bots, bidAttempts: attempts }
      : { adminBid: amount, botBids: bots, bidAttempts: attempts };

    api.put(`/projects/${projectId}`, updateData).then(() => fetchAllData());

    return isWin;
  };

  const assignProjectToHR = async (projectId: string, hrName: string) => {
    await api.put(`/projects/${projectId}`, { assignedHR: hrName, status: "in_progress" });
    fetchAllData();
  };

  const addTaskToProject = async (task: Omit<ProjectTask, "id">) => {
    await api.post("/tasks", task);
    fetchAllData();
  };

  const updateTaskStatus = async (taskId: string, status: ProjectTask["status"]) => {
    await api.put(`/tasks/${taskId}`, { status });
    fetchAllData();
  };

  const submitProject = async (projectId: string) => {
    await api.put(`/projects/${projectId}`, { status: "pending_admin" });
    fetchAllData();
  };

  const finalizeProject = async (projectId: string) => {
    const p = projects.find(proj => proj.id === projectId);
    if (!p) return;

    const projTasks = tasks.filter(t => t.projectId === projectId);
    const uniqueEmployees = new Set(projTasks.map(t => t.assignedEmployeeId).filter(Boolean));
    const totalSalaries = uniqueEmployees.size * 1500;
    const highPriorityCount = projTasks.filter(t => t.priority === "high").length;
    const otPaid = highPriorityCount * 200;
    const rev = p.adminBid || p.estimatedValue;

    const updatedFinances = {
      revenue: finances.revenue + rev,
      totalSalaries: finances.totalSalaries + totalSalaries,
      otPaid: finances.otPaid + otPaid,
      net: finances.net + (rev - totalSalaries - otPaid)
    };
    
    // 1. Update Project Status
    await api.put(`/projects/${projectId}`, { status: "completed" });

    // 2. Persist Finance Updates
    await api.put(`/finances`, updatedFinances);

    fetchAllData();
  };

  return (
    <ProjectContext.Provider value={{
      projects, tasks, finances,
      bidOnProject, assignProjectToHR, addTaskToProject, updateTaskStatus, submitProject, finalizeProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectProvider");
  return ctx;
}
