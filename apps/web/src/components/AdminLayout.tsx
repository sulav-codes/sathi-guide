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
  Menu,
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
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
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
      {/* Mobile Header — fixed so we know exact height (h-16 = 64px) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 bg-card border-b border-border z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Sathi Guide Logo"
              width={32}
              height={32}
              className="object-contain transition-opacity duration-1000"
            />
          </div>
          <span className="font-semibold text-text">Sathi Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={sidebarOpen}
          aria-controls="admin-sidebar"
          className="p-2 text-text-muted hover:text-text rounded-md"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Spacer so page content doesn't hide under fixed mobile header */}
      <div className="md:hidden h-16 flex-shrink-0" />

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={`
          fixed left-0 z-40 w-64 bg-card border-r border-border
          transform transition-transform duration-300 ease-in-out
          md:sticky md:top-0 md:translate-x-0 md:h-screen md:flex-shrink-0
          top-16 bottom-0 md:inset-y-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full p-4 overflow-y-auto">
          {/* Logo — hidden on mobile since mobile header handles it */}
          <div className="hidden md:flex items-center space-x-3 mb-8 p-2">
            {/* Replaced fixed 40x40 gradient box directly with your logo */}
            <Image
              src="/logo.png"
              alt="Sathi Guide Logo"
              width={40}
              height={40}
              className="object-contain transition-opacity duration-1000"
            />

            <div className="flex flex-col">
              {/* Styled text matching React Native colors */}
              <h2 className="flex justify-between gap-0.5 font-bold tracking-tight text-2xl leading-tight pt-[2px]">
                <span className="text-primary">Sathi</span>
                <span className="text-secondary">Guide</span>
              </h2>
              <span className="text-xs text-text-muted">Admin Portal</span>
            </div>
          </div>

          {/* Nav Items */}
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
                      isActive
                        ? "text-primary"
                        : "text-icon group-hover:text-text"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="mt-auto pt-6 border-t border-border space-y-4">
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-sm font-medium text-text-secondary">
                Theme
              </span>
              {mounted && (
                <button
                  onClick={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                  aria-label={
                    resolvedTheme === "dark"
                      ? "Switch to light theme"
                      : "Switch to dark theme"
                  }
                  className="p-2 bg-inactive-card text-icon hover:text-text rounded-lg transition-colors"
                >
                  {resolvedTheme === "dark" ? (
                    <Sun size={18} />
                  ) : (
                    <Moon size={18} />
                  )}
                </button>
              )}
            </div>

            <div className="flex items-center px-4 py-3 bg-inactive-card rounded-xl">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold mr-3">
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {user?.email || "Admin User"}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {user?.role || "Admin"}
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

      {/* Mobile Overlay — sits below header (top-16), above content */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 top-16 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
