"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, MotionConfig } from "motion/react";
import {
  Newspaper,
  Archive,
  Compass,
  Settings2,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: Newspaper, label: "Today" },
  { href: "/archive", icon: Archive, label: "Archive" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/preferences", icon: Settings2, label: "Preferences" },
] as const;

function useIsActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

// ─── Desktop Rail ────────────────────────────────────────────────────────────

function DesktopRail({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Primary navigation"
      className="hidden md:flex fixed left-0 top-0 h-full w-[60px] flex-col items-center bg-paper border-r border-rule z-40"
    >
      {/* Masthead wordmark — rotated vertical */}
      <div className="flex items-center justify-center py-5 w-full">
        <span
          className="font-serif text-ink text-[11px] tracking-[0.25em] uppercase select-none"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          DAYBREAK
        </span>
      </div>

      {/* Divider */}
      <div className="w-8 border-t border-rule mb-3" />

      {/* Nav items */}
      <ul className="flex flex-col items-center gap-1 flex-1 w-full px-1.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = useIsActive(href, pathname);
          return (
            <li key={href} className="w-full">
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex flex-col items-center justify-center gap-1 w-full py-2.5 rounded transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest",
                  active
                    ? "bg-forest text-paper"
                    : "text-ink-soft hover:text-ink hover:bg-paper"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} aria-hidden />
                <span className="text-[9px] font-mono tracking-wide leading-none">
                  {label}
                </span>
                {active && (
                  <motion.span
                    layoutId="rail-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-brass rounded-r"
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Setup link at bottom */}
      <div className="pb-4 w-full px-1.5">
        <div className="w-8 mx-auto border-t border-rule mb-3" />
        <Link
          href="/onboarding"
          aria-label="Setup"
          className={cn(
            "flex flex-col items-center justify-center gap-1 w-full py-2.5 rounded text-ink-soft hover:text-ink hover:bg-paper transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest",
            pathname.startsWith("/onboarding") && "bg-forest text-paper"
          )}
        >
          <PlusCircle size={20} strokeWidth={1.8} aria-hidden />
          <span className="text-[9px] font-mono tracking-wide leading-none">Setup</span>
        </Link>
      </div>
    </nav>
  );
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────

const MOBILE_ITEMS = [
  ...NAV_ITEMS,
  { href: "/onboarding", icon: PlusCircle, label: "Setup" },
] as const;

function MobileBottomNav({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 bg-paper border-t border-rule z-40"
    >
      <ul className="grid grid-cols-5 h-16">
        {MOBILE_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = useIsActive(href, pathname);
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-full transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest",
                  active ? "text-forest" : "text-ink-faint"
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.2 : 1.8}
                  aria-hidden
                />
                <span className="text-[9px] font-mono tracking-wide leading-none">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-paper text-ink">
        <DesktopRail pathname={pathname} />
        <MobileBottomNav pathname={pathname} />

        {/* Main content */}
        <main
          id="main-content"
          className="md:ml-[60px] pb-16 md:pb-0 min-h-screen"
        >
          {children}
        </main>
      </div>
    </MotionConfig>
  );
}
