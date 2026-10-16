"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function QuotesIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 16l4-5 3.5 3L19 6"
        stroke={active ? "var(--vx-brand)" : "var(--vx-text-faint)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 6H19v4.5"
        stroke={active ? "var(--vx-brand)" : "var(--vx-text-faint)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PortfolioIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke={active ? "var(--vx-brand)" : "var(--vx-text-faint)"}
        strokeWidth="2"
      />
      <path
        d="M12 4v8l6 3"
        stroke={active ? "var(--vx-brand)" : "var(--vx-text-faint)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IdeasIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.5.4.8 1 .8 1.6v.5h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0012 3z"
        stroke={active ? "var(--vx-brand)" : "var(--vx-text-faint)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="5" cy="12" r="1.6" fill={active ? "var(--vx-brand)" : "var(--vx-text-faint)"} />
      <circle cx="12" cy="12" r="1.6" fill={active ? "var(--vx-brand)" : "var(--vx-text-faint)"} />
      <circle cx="19" cy="12" r="1.6" fill={active ? "var(--vx-brand)" : "var(--vx-text-faint)"} />
    </svg>
  );
}

const ITEMS = [
  {
    href: "/demo",
    label: "Котировки",
    icon: QuotesIcon,
    match: (p: string) => p === "/demo" || (p.startsWith("/demo/") && !p.startsWith("/demo/portfolio")),
  },
  {
    href: "/demo/portfolio",
    label: "Портфель",
    icon: PortfolioIcon,
    match: (p: string) => p.startsWith("/demo/portfolio"),
  },
  { href: "/demo", label: "Идеи", icon: IdeasIcon, match: () => false },
  { href: "/", label: "Меню", icon: MenuIcon, match: () => false },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t"
      style={{
        background: "color-mix(in srgb, var(--vx-bg) 92%, transparent)",
        borderColor: "var(--vx-border)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="max-w-5xl mx-auto grid grid-cols-4">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-1 py-2.5"
            >
              <Icon active={active} />
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? "var(--vx-brand)" : "var(--vx-text-faint)" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      <div
        className="h-[env(safe-area-inset-bottom)]"
        style={{ background: "var(--vx-bg)" }}
      />
    </nav>
  );
}
