"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    {
      href: "/home",
      label: "Home",
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M11 3L3 10v9h6v-5h4v5h6v-9l-8-7z"
            fill={active ? "#F0EDE4" : "#6b6b6b"}
          />
        </svg>
      ),
    },
    {
      href: "/places",
      label: "Search",
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle
            cx="10"
            cy="10"
            r="6"
            stroke={active ? "#F0EDE4" : "#6b6b6b"}
            strokeWidth="2"
          />
          <path
            d="M15 15l4 4"
            stroke={active ? "#F0EDE4" : "#6b6b6b"}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      href: "/add",
      label: "Add",
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle
            cx="11"
            cy="11"
            r="8.5"
            stroke={active ? "#F0EDE4" : "#6b6b6b"}
            strokeWidth="2"
          />
          <path
            d="M11 7.5v7M7.5 11h7"
            stroke={active ? "#F0EDE4" : "#6b6b6b"}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      href: "/profile",
      label: "Profile",
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle
            cx="11"
            cy="7.5"
            r="3.5"
            stroke={active ? "#F0EDE4" : "#6b6b6b"}
            strokeWidth="2"
          />
          <path
            d="M4 19c0-3.87 3.13-6 7-6s7 2.13 7 6"
            stroke={active ? "#F0EDE4" : "#6b6b6b"}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[2000] bg-[#2a2a2a] rounded-full px-3 py-2.5 flex gap-1 shadow-lg max-w-md w-[calc(100%-2rem)]">
      {tabs.map((tab) => {
        const active =
          pathname === tab.href ||
          (tab.href === "/places" && pathname.startsWith("/places"));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 flex flex-col items-center gap-0.5 py-1"
          >
            {tab.icon(active)}
            <span
              className={`text-[10px] font-bold ${
                active ? "text-[#F0EDE4]" : "text-[#6b6b6b]"
              }`}
            >
              {tab.label}
            </span>
            {active && (
              <div className="w-1 h-1 rounded-full bg-[#974315]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}