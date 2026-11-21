"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Logo } from "@/components/layout/logo";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error de interfaz", error.digest ?? "sin digest");
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <Link href="/" aria-label="PACHAAGRO">
        <Logo />
      </Link>
      <span className="mt-8 grid h-16 w-16 place-items-center rounded-3xl bg-gold-100 text-gold-800">
        <TriangleAlert className="h-8 w-8" aria-hidden />
      </span>
      <h1 className="mt-5 font-display text-3xl font-semibold">
        Algo no salió como esperábamos
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/60">
        La página encontró un error inesperado. Tus datos no se enviaron a
        ningún servicio externo. Puedes intentar nuevamente o volver al inicio.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-pacha-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-pacha-900"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-xl border border-pacha-900/15 px-5 py-2.5 text-sm font-bold text-pacha-900 hover:bg-pacha-50"
        >
          Volver al inicio
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 text-[10px] text-ink/35">Referencia: {error.digest}</p>
      )}
    </div>
  );
}
