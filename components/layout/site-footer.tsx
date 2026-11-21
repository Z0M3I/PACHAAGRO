import Link from "next/link";
import { Leaf, MessageCircle, MapPin } from "lucide-react";
import { Logo } from "@/components/layout/logo";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-pacha-950 text-pacha-100">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo variant="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-pacha-100/65">
            Conectando al productor con la información que necesita. Una
            plataforma para la Bolivia agrícola, con respeto por sus datos y su
            trabajo.
          </p>
          <p className="mt-5 flex items-center gap-2 text-xs text-pacha-100/45">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            Cobertura nacional · 9 departamentos
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-300">
            Plataforma
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link className="text-pacha-100/70 hover:text-white" href="/alertas">
                Alertas agrícolas
              </Link>
            </li>
            <li>
              <Link
                className="text-pacha-100/70 hover:text-white"
                href="/biblioteca"
              >
                Biblioteca educativa
              </Link>
            </li>
            <li>
              <Link className="text-pacha-100/70 hover:text-white" href="/#cobertura">
                Cobertura nacional
              </Link>
            </li>
            <li>
              <Link
                className="text-pacha-100/70 hover:text-white"
                href="/whatsapp"
              >
                Bot de WhatsApp
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-300">
            Acceso
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link className="text-pacha-100/70 hover:text-white" href="/registro">
                Crear cuenta
              </Link>
            </li>
            <li>
              <Link className="text-pacha-100/70 hover:text-white" href="/login">
                Iniciar sesión
              </Link>
            </li>
            <li>
              <Link className="text-pacha-100/70 hover:text-white" href="/panel">
                Panel del productor
              </Link>
            </li>
            <li>
              <Link className="text-pacha-100/70 hover:text-white" href="/admin">
                Administración
              </Link>
            </li>
            <li>
              <Link
                className="text-pacha-100/70 hover:text-white"
                href="/privacidad"
              >
                Privacidad
              </Link>
            </li>
            <li>
              <Link
                className="text-pacha-100/70 hover:text-white"
                href="/terminos"
              >
                Términos de uso
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-300">
            Contacto
          </p>
          <ul className="mt-4 space-y-3 text-sm text-pacha-100/70">
            <li className="flex items-start gap-2">
              <MessageCircle className="mt-0.5 h-4 w-4 text-pacha-300" aria-hidden />
              WhatsApp oficial de la plataforma: configurable por el
              administrador.
            </li>
            <li className="flex items-start gap-2">
              <Leaf className="mt-0.5 h-4 w-4 text-pacha-300" aria-hidden />
              Contenido educativo con fuentes y advertencias visibles.
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-pacha-100/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} PACHAAGRO · Abstracthon 2026</p>
          <p>
            Datos DEMO identificados como tales. Las alertas oficiales dependen
            de las autoridades competentes.
          </p>
        </div>
      </div>
    </footer>
  );
}
