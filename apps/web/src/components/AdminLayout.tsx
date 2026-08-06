"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "next-themes";
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  LogOut,
  Sun,
  Moon,
  Menu
} from "lucide-react";
import { useState, useEffect } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Guides Verification", href: "/admin/guides", icon: Users },
    { name: "Content Moderation", href: "/admin/reports", icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-primary to-tint rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">SG</span>
          </div>
          <span className="font-semibold text-text">Sathi Admin</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-text-muted hover:text-text rounded-md">
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-4">
          <div className="hidden md:flex items-center space-x-3 mb-8 p-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary to-tint rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
              <span className="text-white font-bold text-lg">SG</span>
            </div>
            <div>
              <h2 className="font-bold text-text tracking-tight leading-tight">Sathi Guide</h2>
              <span className="text-xs text-text-muted">Admin Portal</span>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? "bg-active-card text-primary" 
                      : "text-text-secondary hover:bg-inactive-card hover:text-text"
                  }`}
                >
                  <item.icon 
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive ? "text-primary" : "text-icon group-hover:text-text"
                    }`} 
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-border space-y-4">
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-sm font-medium text-text-secondary">Theme</span>
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 bg-inactive-card text-icon hover:text-text rounded-lg transition-colors"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              )}
            </div>
            
            <div className="flex items-center px-4 py-3 bg-inactive-card rounded-xl">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold mr-3">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {user?.email || 'Admin User'}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {user?.role || 'Admin'}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-500 rounded-xl hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
