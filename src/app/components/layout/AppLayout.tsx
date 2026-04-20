import React from "react";
import { FloatingNav } from "./FloatingNav";
import { Outlet, useLocation } from "react-router";
import { cn } from "../../lib/utils";
import { AuthProvider } from "../../context/AuthContext";
import { SystemProvider } from "../../context/SystemContext";
import { ProjectProvider } from "../../context/ProjectContext";
import { TimeProvider } from "../../context/TimeContext";
import { TimeSimulationPanel } from "../ui/TimeSimulationPanel";

import { NotificationProvider } from "../../context/NotificationContext";
import { LeaveProvider } from "../../context/LeaveContext";

export function AppLayout() {
  return (
    <TimeProvider>
      <AuthProvider>
        <NotificationProvider>
          <SystemProvider>
            <ProjectProvider>
              <LeaveProvider>
                <AppLayoutInner />
              </LeaveProvider>
            </ProjectProvider>
          </SystemProvider>
        </NotificationProvider>
      </AuthProvider>
    </TimeProvider>
  );
}

function AppLayoutInner() {
  const location = useLocation();
  const isLogin = location.pathname === "/";

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans selection:bg-blue-500/20">
      {location.pathname.endsWith("/dashboard") && <TimeSimulationPanel />}
      {/* Soft Background Decorations */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/60 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-100/50 blur-[150px]" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-purple-100/40 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNCkiLz48L3N2Zz4=')] opacity-30 pointer-events-none" />
      </div>

      {/* Main Content Area */}
      <main className={cn(
        "relative z-10 w-full min-h-screen pt-4 pb-12 mx-auto flex flex-col transition-all duration-300 max-w-[1400px]",
        isLogin ? "px-4" : "pl-20 md:pl-28 xl:pl-32 pr-4 md:pr-8 xl:pr-12"
      )}>
        <div className="flex-1 w-full h-full flex flex-col">
          <Outlet />
        </div>
      </main>

      {/* Show Nav unless on login */}
      {!isLogin && <FloatingNav />}
    </div>
  );
}
