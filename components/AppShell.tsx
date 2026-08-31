"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 transition-colors ${
            active ? "text-primary-500" : "text-gray-400 group-hover:text-primary-400"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      label: "History",
      href: "/history",
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 transition-colors ${
            active ? "text-primary-500" : "text-gray-400 group-hover:text-primary-400"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "Learn",
      href: "/learn",
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 transition-colors ${
            active ? "text-primary-500" : "text-gray-400 group-hover:text-primary-400"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      label: "Profile",
      href: "/profile",
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 transition-colors ${
            active ? "text-primary-500" : "text-gray-400 group-hover:text-primary-400"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between max-w-md mx-auto relative shadow-card border-x border-primary-100/50">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-md px-5 pt-6 pb-4 flex items-center justify-between border-b border-primary-100/60">
        <div className="flex items-center gap-3">
          {/* Avatar Initial */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-600 to-accent-purple flex items-center justify-center text-white font-bold text-lg shadow-soft border-2 border-white">
            S
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-1.5 leading-tight">
              Hello, Sanjith <span className="animate-pulse">👋</span>
            </h1>
            <p className="text-xs text-primary-600 font-medium tracking-wide">
              Let&apos;s communicate together
            </p>
          </div>
        </div>

        {/* History / Clock Icon Button */}
        <Link
          href="/history"
          aria-label="View translation history"
          className="w-10 h-10 rounded-2xl bg-white border border-primary-100 text-primary-600 flex items-center justify-center shadow-soft hover:bg-primary-50 hover:text-primary-700 transition active:scale-95"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </Link>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 px-5 py-4 pb-28">{children}</main>

      {/* Bottom Tab Bar (Fixed) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto bg-white/90 backdrop-blur-lg border-t border-primary-100/80 px-4 py-2 flex justify-around items-center rounded-t-3xl shadow-card">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition group active:scale-95"
            >
              <div
                className={`p-1 rounded-xl transition ${
                  isActive ? "bg-primary-50 text-primary-500 scale-105" : ""
                }`}
              >
                {item.icon(isActive)}
              </div>
              <span
                className={`text-[11px] font-semibold tracking-wide transition ${
                  isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
