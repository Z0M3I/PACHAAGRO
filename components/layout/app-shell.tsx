"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  CalendarDays,
  CloudSun,
  Home,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Send,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { DemoBadge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/types/actions";
import type { NavItem } from "@/components/layout/nav-config";
import { signOutAction } from "@/lib/auth/actions";
import { cn, initials } from "@/lib/utils";

const icons = {
  home: Home,
  megaphone: Megaphone,
  calendar: CalendarDays,
  cloud: CloudSun,
  book: BookOpen,
  bell: Bell,
  user: UserRound,
  dashboard: LayoutDashboard,
  users: Users,
  send: Send,
  shield: ShieldCheck,
} as const;

interface AppShellProps {
  user: {
    fullName: string;
    email: string | null;
    role: keyof typeof ROLE_LABELS;
    avatarUrl: string | null;
  };
  nav: NavItem[];
  isDemo: boolean;
  variant: "panel" | "admin";
  children: ReactNode;
}

export function AppShell({
  user,
  nav,
  isDemo,
  variant,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (item: NavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const sidebar = (
    <div className="flex h-full flex-col bg-pacha-950 text-pacha-100">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/" aria-label="PACHAAGRO, inicio">
          <Logo variant="light" />
        </Link>
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-lg text-pacha-100/70 hover:bg-white/10 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-4 mb-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-pacha-300">
          {variant === "admin" ? "Administración" : "Mi campo"}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-white">
          {variant === "admin" ? "Centro de gestión" : "Panel del productor"}
        </p>
      </div>

      <nav
        className="flex-1 space-y-1 overflow-y-auto px-3 pb-4"
        aria-label={variant === "admin" ? "Navegación administrativa" : "Navegación del panel"}
      >
        {nav.map((item) => {
          const Icon = icons[item.icon];
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-gold-400 text-pacha-950 shadow-sm"
                  : "text-pacha-100/65 hover:bg-white/8 hover:text-white",
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}

        {variant === "panel" && (
          <div className="mt-4 border-t border-white/10 pt-3">
            <Link
              href="/biblioteca"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-pacha-100/65 hover:bg-white/8 hover:text-white"
            >
              <BookOpen className="h-4.5 w-4.5" aria-hidden />
              Biblioteca pública
            </Link>
          </div>
        )}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-400 text-xs font-bold text-pacha-950">
            {initials(user.fullName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {user.fullName}
            </p>
            <p className="truncate text-[11px] text-pacha-100/50">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
        </div>
        <div className="mt-1 flex items-center justify-between gap-2 px-2">
          {isDemo ? <DemoBadge /> : <span />}
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-pacha-100/60 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Salir
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-mist">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] lg:block">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-pacha-950/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          />
          <div className="absolute inset-y-0 left-0 w-[286px] shadow-2xl">
            {sidebar}
          </div>
        </div>
      )}

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-30 border-b border-pacha-900/8 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-pacha-900/12 bg-white text-pacha-900 lg:hidden"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden sm:block">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/40">
                  PACHAAGRO
                </p>
                <p className="text-sm font-semibold text-pacha-950">
                  {variant === "admin"
                    ? "Panel administrativo"
                    : "Comunicación y educación agrícola"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isDemo && (
                <Link
                  href="/api/health"
                  className="hidden rounded-full border border-gold-500/30 bg-gold-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-800 sm:block"
                >
                  Demo · no oficial
                </Link>
              )}
              <Link
                href="/"
                className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-pacha-800 hover:bg-pacha-100"
              >
                Ver sitio
              </Link>
              <span className="hidden text-xs text-ink/50 md:block">
                {user.email}
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-pacha-100 text-xs font-bold text-pacha-900">
                {initials(user.fullName)}
              </span>
            </div>
          </div>
        </header>

        <main id="contenido" className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {isDemo && variant === "admin" && (
            <div className="mb-5 rounded-xl border border-gold-500/30 bg-gold-50 px-4 py-2.5 text-xs text-gold-900">
              Estás trabajando con datos DEMO. Las acciones no se envían a Meta
              ni persisten en Supabase y se identifican como simuladas.
            </div>
          )}
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
