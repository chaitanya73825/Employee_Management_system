import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from "react";
import { useTime } from "./TimeContext";
import { api } from "../lib/api";

export type HRNode = {
  id: string;
  name: string;
  department: string;
  email: string;
  teamSize: number; // dynamically calculated
  load: number;     // dynamically calculated based on max 5
  status: string;   // dynamically calculated (Idle, Stable, High Load)
};

export type Employee = {
  id: string;
  name: string;
  employeeId?: string;
  role: string;
  department: string;
  hrId: string | null;
  status: "active" | "leave";
};

interface SystemContextType {
  hrNodes: HRNode[];
  employees: Employee[];
  fetchUsers: () => Promise<void>;
  assignEmployee: (empId: string, hrId: string | null) => void;
  promoteToHR: (empId: string) => Promise<void>;
}

const SystemContext = createContext<SystemContextType | null>(null);

export function SystemProvider({ children }: { children: React.ReactNode }) {
  const [allUsers, setAllUsers] = useState<Employee[]>([]);
  const { simulatedTime } = useTime();
  const lastLeaveUpdateRef = useRef(simulatedTime.getTime());

  const fetchUsers = async () => {
    try {
      const data = await api.get("/users");
      
      const mappedEmployees: Employee[] = data
        .filter((u: any) => u.role !== "admin")
        .map((u: any) => ({
          id: u._id,
          name: u.name,
          employeeId: u.employeeId,
          role: u.role,
          department: "Engineering", // Default mocked for now
          hrId: u.hrId || null,
          status: "active"
        }));

      setAllUsers(mappedEmployees);
    } catch (err) {
      console.error(err);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // Time simulation for leaves
  useEffect(() => {
    const now = simulatedTime.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (now - lastLeaveUpdateRef.current >= oneDayMs) {
      const daysPassed = Math.floor((now - lastLeaveUpdateRef.current) / oneDayMs);
      lastLeaveUpdateRef.current += daysPassed * oneDayMs;
      
      setAllUsers((prev) =>
        prev.map((emp) => {
          let newStatus = emp.status;
          for (let i = 0; i < daysPassed; i++) {
             if (newStatus === "leave" && Math.random() < 0.2) newStatus = "active";
             else if (newStatus === "active" && Math.random() < 0.005) newStatus = "leave";
          }
          return { ...emp, status: newStatus };
        })
      );
    }
  }, [simulatedTime]);

  const assignEmployee = async (empId: string, hrId: string | null) => {
    try {
      await api.put(`/users/${empId}/assign-hr`, { hrId });
      fetchUsers(); // Refresh
    } catch (err) {
      console.error(err);
    }
  };

  const promoteToHR = async (empId: string) => {
    try {
      await api.put(`/users/${empId}/promote`, {});
      await fetchUsers(); // Re-sync local state with MongoDB
    } catch (err) {
      console.error("Error promoting:", err);
    }
  };

  // Expose ONLY 'employee' role users for the employee list
  const employees = useMemo(() => allUsers.filter(u => u.role === "employee"), [allUsers]);
 
  // Dynamically calculate HR Nodes based purely on 'hr' role users in MongoDB
  const hrNodes: HRNode[] = useMemo(() => {
    const hrUsers = allUsers.filter(e => e.role === "hr");
    
    return hrUsers.map((hr) => {
      const teamSize = allUsers.filter((e) => e.hrId === hr.id).length;
      const load = Math.min((teamSize / 5) * 100, 100);
      
      let status = "Stable";
      if (load >= 100) status = "High Load";
      else if (load <= 20) status = "Idle";
      else if (load >= 60) status = "Moderate";

      return {
        id: hr.id,
        name: hr.name,
        department: hr.department,
        email: hr.employeeId ? `${hr.employeeId}@nexus.sys` : `${hr.name}@nexus.sys`,
        teamSize,
        load,
        status,
      };
    });
  }, [employees]);

  return (
    <SystemContext.Provider value={{ hrNodes, employees, fetchUsers, assignEmployee, promoteToHR }}>
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const ctx = useContext(SystemContext);
  if (!ctx) throw new Error("useSystem must be used within SystemProvider");
  return ctx;
}
