import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';

export type LeaveRequest = {
  id: string;
  userId: string;
  userName: string;
  hrId: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

interface LeaveContextType {
  leaves: LeaveRequest[];
  fetchUserLeaves: () => Promise<void>;
  fetchHRLeaves: () => Promise<void>;
  applyLeave: (data: any) => Promise<boolean>;
  updateLeaveStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  loading: boolean;
}

const LeaveContext = createContext<LeaveContextType | null>(null);

export function LeaveProvider({ children }: { children: React.ReactNode }) {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchUserLeaves = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.get(`/leaves/user/${user.id}`);
      setLeaves(data.map((l: any) => ({ ...l, id: l._id })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchHRLeaves = useCallback(async () => {
    if (!user || user.role !== 'hr') return;
    setLoading(true);
    try {
      const data = await api.get(`/leaves/hr/${user.id}`);
      setLeaves(data.map((l: any) => ({ ...l, id: l._id })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const applyLeave = async (leaveData: any) => {
    try {
      await api.post("/leaves", {
        ...leaveData,
        userId: user?.id,
        userName: user?.name,
        hrId: user?.hrId
      });
      await fetchUserLeaves();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const updateLeaveStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.put(`/leaves/${id}/status`, { status });
      await fetchHRLeaves();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <LeaveContext.Provider value={{ leaves, fetchUserLeaves, fetchHRLeaves, applyLeave, updateLeaveStatus, loading }}>
      {children}
    </LeaveContext.Provider>
  );
}

export function useLeaves() {
  const ctx = useContext(LeaveContext);
  if (!ctx) throw new Error("useLeaves must be used within LeaveProvider");
  return ctx;
}
