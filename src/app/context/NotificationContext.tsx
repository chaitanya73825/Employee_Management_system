import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { api } from "../lib/api";

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'task_assigned' | 'project_assigned' | 'task_submitted' | 'task_rejected' | 'task_approved';
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const data = await api.get(`/notifications/${user.id}`);
      const newNotifications = data.map((n: any) => ({ ...n, id: n._id }));
      const newUnreadCount = newNotifications.filter((n: any) => !n.isRead).length;
      
      // Play sound if new unread notification arrives
      if (newUnreadCount > unreadCount) {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
        audio.volume = 0.2; // Smooth and low volume
        audio.play().catch(e => console.log("Autoplay blocked or audio failed:", e));
      }
      
      setUnreadCount(newUnreadCount);
      setNotifications(newNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await api.put(`/notifications/read-all/${user.id}`, {});
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
