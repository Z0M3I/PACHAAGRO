"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ButtonLink } from "@/components/ui/button";

const links = [
  { href: "/alertas", label: "Alertas" },
  { href: "/biblioteca", label: "Biblioteca" },
  { href: "/#cobertura", label: "Cobertura" },
  { href: "/whatsapp", label: "WhatsApp" },
];

export function SiteHeader({ hasSession }: { hasSession: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-pacha-900/8 bg-cream/90 backdrop-blur-lg">
      <div className="container-page flex h-[72px] items-center justify-between gap-4">
        <Link href="/" aria-label="PACHAAGRO, ir al inicio">
          <Logo />
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Navegación principal"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-ink/70 transition hover:bg-pacha-100/70 hover:text-pacha-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          {hasSession ? (
            <ButtonLink href="/panel" size="sm">
              Ir a mi panel
              <ArrowUpRight className="h-3.5 w-3.5" />
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                Iniciar sesión
              </ButtonLink>
              <ButtonLink href="/registro" size="sm">
                Registrarme
              </ButtonLink>
            </>
          )}
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-xl border border-pacha-900/15 bg-white text-pacha-900 sm:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="border-t border-pacha-900/10 bg-cream px-4 pb-5 pt-3 sm:hidden"
        >
          <nav className="flex flex-col" aria-label="Navegación móvil">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-ink/75 hover:bg-pacha-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 grid gap-2">
            {hasSession ? (
              <ButtonLink href="/panel" onClick={() => setOpen(false)}>
                Ir a mi panel
              </ButtonLink>
            ) : (
              <>
                <ButtonLink
                  href="/registro"
                  onClick={() => setOpen(false)}
                  className="w-full"
                >
                  Crear mi cuenta
                </ButtonLink>
                <ButtonLink
                  href="/login"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="w-full"
                >
                  Iniciar sesión
                </ButtonLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
