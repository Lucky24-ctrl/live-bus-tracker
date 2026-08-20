import { Link } from "@tanstack/react-router";
import { Bus, Menu } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/passenger", label: "Live map" },
  { to: "/driver", label: "Driver" },
  { to: "/admin", label: "Admin" },
] as const;

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bus className="h-4 w-4" />
            </span>
            <span className="font-display text-base font-semibold tracking-tight">BusLive</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "bg-secondary text-foreground" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="rounded-md px-3 py-1.5 text-sm transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-md border border-border p-2 md:hidden"
            aria-label="Toggle navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        <nav className={cn("border-t border-border px-4 pb-3 pt-2 md:hidden", !open && "hidden")}>
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "bg-secondary text-foreground" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        {title ? (
          <div className="mb-5">
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
        ) : null}
        {children}
      </main>
    </div>
  );
}
