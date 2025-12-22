import React, { useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  Radio,
  Settings,
  LogOut,
  Menu,
  BookOpenCheck,
  Clock,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/AuthContext";
import { useSchoolSettings } from "@/features/settings/SchoolSettingsContext";
import { Modal, Button } from "@/shared/ui";

const Layout: React.FC = () => {
  const { logout, user } = useAuth();
  const { settings } = useSchoolSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] =
    useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Use useRouterState to access location since useLocation export might be missing in some bundles
  const location = useRouterState({ select: (s) => s.location });

  // Derive user display values
  const displayName = user?.displayName || "Admin User";
  const email = user?.email || "admin@school.edu";
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "AD";

  const navItems = [
    { to: "/overview", label: "Overview", icon: <LayoutDashboard size={20} /> },
    { to: "/students", label: "Students", icon: <GraduationCap size={20} /> },
    {
      to: "/daily-updates",
      label: "Daily Updates",
      icon: <BookOpenCheck size={20} />,
    },
    // { to: "/reports", label: "Reports", icon: <FileText size={20} /> },
    { to: "/broadcast", label: "Broadcast", icon: <Radio size={20} /> },
    // { to: "/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="h-screen w-full bg-slate-50 flex overflow-hidden font-sans text-slate-900 selection:bg-sky-100 selection:text-sky-900">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 backdrop-blur-3xl bg-slate-50 border-r border-slate-200 transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col h-full shrink-0 shadow-sm
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }
      `}
      >
        {/* Sidebar Header */}
        <div className="h-24 flex items-center px-8 shrink-0">
          <div className="flex items-center gap-3">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="School Logo"
                className="w-10 h-10 rounded-md object-cover shadow-md shadow-sky-500/10"
              />
            ) : (
              <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/30">
                <span className="text-white font-bold text-xl">
                  {(settings?.schoolName || "E").charAt(0)}
                </span>
              </div>
            )}

            <div className="relative top-0.5">
              <span className="text-lg font-bold tracking-tight block leading-none text-slate-900">
                {settings?.schoolName || "EduSync"}
              </span>
              <span className="text-[10px] font-bold text-sky-600/80 uppercase tracking-widest mt-0.5 block">
                Powered by EduSync
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto mt-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              className="group relative w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 overflow-hidden"
              activeProps={{
                className:
                  "bg-white shadow-sm ring-1 ring-slate-200 text-sky-700 font-bold",
              }}
              inactiveProps={{
                className:
                  "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
              }}
            >
              <span className="relative z-10 flex items-center gap-3">
                {item.icon}
                {item.label}
              </span>

              {/* Active Indicator Line for mobile or specific styles */}
              {location.pathname === item.to && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-sky-500 rounded-full"></div>
              )}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer with User Profile */}
        <div className="p-4 shrink-0 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-blue-50 border border-white shadow-inner flex items-center justify-center text-sky-700 font-bold text-sm">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-slate-500 truncate">{email}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                to="/settings"
                className="flex-1 flex items-center justify-center py-2 rounded-lg bg-slate-50 border border-slate-100 shadow-sm text-slate-600 hover:text-sky-600 hover:border-sky-100 transition-all"
                title="Settings"
              >
                <Settings size={18} />
              </Link>
              <button
                onClick={() => setIsLogoutConfirmationOpen(true)}
                className="flex-1 flex items-center justify-center py-2 rounded-lg bg-slate-50 border border-slate-100 shadow-sm text-red-600 hover:text-red-600 hover:border-red-100 transition-all"
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          <div className="px-4 py-2 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
            <span className="text-xs text-emerald-600 font-medium">
              System Online
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full transition-all duration-300 relative">
        {/* Navbar */}
        <header className="sticky top-0 z-30 h-24 px-4 lg:px-8 flex items-center justify-between bg-white/50 backdrop-blur-xl transition-all duration-200 shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            {/* Breadcrumb / Page Title */}
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <Link
                  to="/overview"
                  className="hover:text-sky-600 transition-colors"
                >
                  Overview
                </Link>
                {location.pathname !== "/overview" && (
                  <>
                    <ChevronRight size={14} />
                    <span className="font-medium text-slate-900">
                      {navItems.find((i) => location.pathname.includes(i.to))
                        ?.label || "Page"}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-600 text-sm font-medium">
              <Calendar size={16} className="text-sky-600" />
              <span>
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <div className="w-px h-4 bg-slate-200 mx-2"></div>
              <Clock size={16} className="text-sky-600" />
              <span>
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50/50 scroll-smooth">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
      <Modal
        isOpen={isLogoutConfirmationOpen}
        onClose={() => setIsLogoutConfirmationOpen(false)}
        title="Confirm Logout"
        description="Are you sure you want to log out of the admin console?"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsLogoutConfirmationOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                logout();
                setIsLogoutConfirmationOpen(false);
              }}
            >
              Log Out
            </Button>
          </>
        }
      >
        <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm">
          You will need to sign in again to access the dashboard.
        </div>
      </Modal>
    </div>
  );
};

export default Layout;
