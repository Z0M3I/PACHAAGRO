import Link from "next/link";
import { Compass, Home, MapPin } from "lucide-react";
import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <Link href="/" aria-label="PACHAAGRO">
        <Logo />
      </Link>
      <span className="mt-8 grid h-16 w-16 place-items-center rounded-3xl bg-pacha-100 text-pacha-800">
        <Compass className="h-8 w-8" aria-hidden />
      </span>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-pacha-700">
        Error 404
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold">
        Este camino no lleva a ninguna parcela
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/60">
        La página que buscas no existe, cambió de dirección o el contenido ya no
        está publicado.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-pacha-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-pacha-900"
        >
          <Home className="h-4 w-4" aria-hidden />
          Ir al inicio
        </Link>
        <Link
          href="/biblioteca"
          className="inline-flex items-center gap-2 rounded-xl border border-pacha-900/15 px-5 py-2.5 text-sm font-bold text-pacha-900 hover:bg-pacha-50"
        >
          <MapPin className="h-4 w-4" aria-hidden />
          Explorar la biblioteca
        </Link>
      </div>
    </div>
  );
}
