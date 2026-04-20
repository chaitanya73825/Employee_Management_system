import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { 
  LayoutGrid, Users, CheckSquare, Calendar, 
  BarChart3, Settings, LogOut, Network, Target, 
  UserCheck, Home, PieChart, Gavel, Briefcase,
  MessageCircle, ShieldCheck, Bell
} from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { useAuth, type UserRole } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";

type NavItem = { path: string; icon: React.ComponentType<{ className?: string }>; label: string };

const ADMIN_NAV: NavItem[] = [
  { path: "/admin/dashboard", icon: LayoutGrid, label: "Dashboard" },
  { path: "/admin/hiring", icon: Users, label: "Hiring" },
  { path: "/admin/hr-management", icon: Network, label: "HR Nodes" },
  { path: "/admin/employees", icon: UserCheck, label: "Assignments" },
  { path: "/admin/bidding", icon: Gavel, label: "Bidding" },
  { path: "/admin/projects", icon: Briefcase, label: "Active Projects" },
  { path: "/admin/payroll", icon: PieChart, label: "Payroll" },
  { path: "/admin/reports", icon: BarChart3, label: "Reports" },
];

const HR_NAV: NavItem[] = [
  { path: "/hr/dashboard", icon: LayoutGrid, label: "Dashboard" },
  { path: "/hr/team", icon: Users, label: "Team" },
  { path: "/hr/tasks", icon: Target, label: "Tasks" },
  { path: "/hr/leave-requests", icon: Calendar, label: "Leave Requests" },
  { path: "/hr/messages", icon: MessageCircle, label: "Messages" },
];

const EMPLOYEE_NAV: NavItem[] = [
  { path: "/employee/dashboard", icon: Home, label: "Dashboard" },
  { path: "/employee/tasks", icon: CheckSquare, label: "My Tasks" },
  { path: "/employee/leave", icon: Calendar, label: "Apply Leave" },
  { path: "/employee/my-hr", icon: ShieldCheck, label: "My HR" },
];

const NAV_MAP: Record<UserRole, NavItem[]> = {
  admin: ADMIN_NAV,
  hr: HR_NAV,
  employee: EMPLOYEE_NAV,
};

export function FloatingNav() {
  const { role, clearRole } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  if (!role) return null;

  const navItems = NAV_MAP[role];

  const handleLogout = () => {
    clearRole();
    navigate("/");
  };

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex items-start gap-4"
    >
      <GlassCard 
        blur="lg" 
        className="flex flex-col items-center gap-2 p-2 rounded-full pointer-events-auto border-slate-200 shadow-xl bg-white/80"
      >
        {/* Notifications Bell */}
        <div className="relative">
          <button 
            onClick={() => {
              if (!showNotifications) markAllAsRead();
              setShowNotifications(!showNotifications);
            }}
            className={cn(
              "p-3 rounded-full transition-all duration-300 relative",
              showNotifications ? "bg-blue-100 text-blue-600" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            )}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                className="absolute left-16 top-0 w-80 max-h-[400px] overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-[60]"
              >
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                    <Bell className="w-4 h-4 text-blue-500" /> Notifications
                  </h3>
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{unreadCount} New</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <p className="text-center py-10 text-xs text-slate-400 italic">All caught up!</p>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => markAsRead(n.id)}
                        className={cn(
                          "p-3 rounded-xl mb-1 cursor-pointer transition-all border border-transparent text-left",
                          !n.isRead ? "bg-blue-50 border-blue-100/50" : "hover:bg-slate-50"
                        )}
                      >
                         <div className="flex gap-3">
                           <div className={cn(
                             "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                             !n.isRead ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-slate-300"
                           )} />
                           <div>
                             <p className={cn("text-[11px] leading-relaxed", !n.isRead ? "text-slate-800 font-medium" : "text-slate-500")}>
                               {n.message}
                             </p>
                             <p className="text-[9px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                           </div>
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-8 h-px bg-slate-200 my-1" />

        <div className={cn(
          "text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full mb-1",
          role === "admin" ? "bg-red-50 text-red-500" :
          role === "hr" ? "bg-blue-50 text-blue-500" :
          "bg-green-50 text-green-500"
        )}>
          {role}
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "relative flex items-center justify-center p-3 rounded-full transition-all duration-300 group outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                isActive
                  ? "text-blue-600 bg-blue-50 shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]")} />
                
                <div className="absolute left-14 scale-0 group-hover:scale-100 transition-transform origin-left duration-200 z-[70]">
                  <div className="bg-white text-slate-700 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-slate-200">
                    {item.label}
                  </div>
                </div>

                {isActive && (
                  <motion.div
                    layoutId="nav-active-indicator"
                    className="absolute inset-0 border border-blue-400/50 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}

        <div className="w-8 h-px bg-slate-200 my-2" />

        <button
          onClick={handleLogout}
          className="relative flex items-center justify-center p-3 rounded-full text-red-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 group"
        >
           <LogOut className="w-5 h-5 group-hover:drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
           <div className="absolute left-14 scale-0 group-hover:scale-100 transition-transform origin-left duration-200">
             <div className="bg-white text-red-500 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-red-100">
               Logout
             </div>
           </div>
        </button>
      </GlassCard>
    </motion.div>
  );
}
