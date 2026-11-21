import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { isDemoMode } from "@/lib/env";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-cream lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-pacha-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 topo-pattern opacity-80" aria-hidden />
        <div className="absolute inset-0 grain-overlay opacity-20" aria-hidden />
        <div className="relative">
          <Link href="/" aria-label="Volver al inicio de PACHAAGRO">
            <Logo variant="light" />
          </Link>
        </div>

        <div className="relative max-w-md">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-300">
            Conectando al productor con la información
          </p>
          <h2 className="mt-4 text-balance font-display text-4xl font-semibold leading-tight text-white">
            Cada decisión del campo merece información clara.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-pacha-100/65">
            Alertas con fuente, anuncios de tu comunidad, reuniones y guías
            agrícolas. En la web y por WhatsApp, con tu consentimiento.
          </p>
          <div className="mt-8 space-y-3 text-sm text-pacha-100/75">
            {[
              "Datos organizados por departamento, municipio y cultivo.",
              "Notificaciones que puedes activar y desactivar cuando quieras.",
              "Contenido educativo con advertencias y notas de fuente.",
            ].map((item) => (
              <p key={item} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                {item}
              </p>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-pacha-100/35">
          © {new Date().getFullYear()} PACHAAGRO · Abstracthon 2026
          {isDemoMode && " · Modo demostración"}
        </p>
      </aside>

      <main
        id="contenido"
        className="flex min-h-screen flex-col px-4 py-6 sm:px-8 lg:px-14"
      >
        <div className="flex items-center justify-between lg:justify-end">
          <Link href="/" className="lg:hidden" aria-label="Inicio PACHAAGRO">
            <Logo />
          </Link>
          <Link
            href="/"
            className="text-xs font-bold text-pacha-800 hover:text-pacha-950"
          >
            Volver al inicio
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-lg">{children}</div>
        </div>
        <p className="text-center text-[11px] text-ink/40">
          PACHAAGRO · Plataforma de comunicación y educación agrícola
        </p>
      </main>
    </div>
  );
}
