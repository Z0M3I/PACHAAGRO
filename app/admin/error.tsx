"use client";

import { RefreshCw } from "lucide-react";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="font-display text-2xl font-semibold">
        El panel administrativo encontró un error
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/60">
        No se realizaron envíos externos. Revisa la conexión e intenta
        nuevamente.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-pacha-800 px-5 py-2.5 text-sm font-bold text-white"
      >
        <RefreshCw className="h-4 w-4" aria-hidden />
        Intentar de nuevo
      </button>
    </div>
  );
}
