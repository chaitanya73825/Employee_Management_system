import { createBrowserRouter, Navigate } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Payroll from "./pages/Payroll";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import HRManagement from "./pages/admin/HRManagement";
import EmployeeAssignment from "./pages/admin/EmployeeAssignment";
import Reports from "./pages/admin/Reports";
import Bidding from "./pages/admin/Bidding";
import ActiveProjects from "./pages/admin/ActiveProjects";
import Hiring from "./pages/admin/Hiring";

// HR pages
import HRDashboard from "./pages/hr/HRDashboard";
import TeamEmployees from "./pages/hr/TeamEmployees";
import TaskAssignment from "./pages/hr/TaskAssignment";
import LeaveRequests from "./pages/hr/LeaveRequests";
import HRMessages from "./pages/hr/HRMessages";

// Employee pages
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import MyTasks from "./pages/employee/MyTasks";
import ApplyLeave from "./pages/employee/ApplyLeave";
import MyHR from "./pages/employee/MyHR";

import { RoleGuard } from "./context/AuthContext";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      { index: true, Component: Login },

      // ─── Admin Routes ───
      {
        path: "admin/dashboard",
        element: <RoleGuard allowedRole="admin"><AdminDashboard /></RoleGuard>,
      },
      {
        path: "admin/hr-management",
        element: <RoleGuard allowedRole="admin"><HRManagement /></RoleGuard>,
      },
      {
        path: "admin/employees",
        element: <RoleGuard allowedRole="admin"><EmployeeAssignment /></RoleGuard>,
      },
      {
        path: "admin/reports",
        element: <RoleGuard allowedRole="admin"><Reports /></RoleGuard>,
      },
      {
        path: "admin/payroll",
        element: <RoleGuard allowedRole="admin"><Payroll /></RoleGuard>,
      },
      {
        path: "admin/bidding",
        element: <RoleGuard allowedRole="admin"><Bidding /></RoleGuard>,
      },
      {
        path: "admin/projects",
        element: <RoleGuard allowedRole="admin"><ActiveProjects /></RoleGuard>,
      },
      {
        path: "admin/hiring",
        element: <RoleGuard allowedRole="admin"><Hiring /></RoleGuard>,
      },

      // ─── HR Routes ───
      {
        path: "hr/dashboard",
        element: <RoleGuard allowedRole="hr"><HRDashboard /></RoleGuard>,
      },
      {
        path: "hr/team",
        element: <RoleGuard allowedRole="hr"><TeamEmployees /></RoleGuard>,
      },
      {
        path: "hr/tasks",
        element: <RoleGuard allowedRole="hr"><TaskAssignment /></RoleGuard>,
      },
      {
        path: "hr/leave-requests",
        element: <RoleGuard allowedRole="hr"><LeaveRequests /></RoleGuard>,
      },
      {
        path: "hr/messages",
        element: <RoleGuard allowedRole="hr"><HRMessages /></RoleGuard>,
      },

      // ─── Employee Routes ───
      {
        path: "employee/dashboard",
        element: <RoleGuard allowedRole="employee"><EmployeeDashboard /></RoleGuard>,
      },
      {
        path: "employee/tasks",
        element: <RoleGuard allowedRole="employee"><MyTasks /></RoleGuard>,
      },
      {
        path: "employee/leave",
        element: <RoleGuard allowedRole="employee"><ApplyLeave /></RoleGuard>,
      },
      {
        path: "employee/my-hr",
        element: <RoleGuard allowedRole="employee"><MyHR /></RoleGuard>,
      },

      // Catch-all
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
