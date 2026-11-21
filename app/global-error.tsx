"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "#FBFAF5",
          color: "#16241B",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <main>
          <p style={{ color: "#27864A", fontWeight: 700, letterSpacing: "0.12em" }}>
            PACHAAGRO
          </p>
          <h1 style={{ fontSize: "28px", marginTop: "12px" }}>
            No pudimos cargar la aplicación
          </h1>
          <p style={{ maxWidth: "420px", color: "#556", lineHeight: 1.6 }}>
            Ocurrió un error inesperado. Intenta recargar la página. No se
            enviaron datos a servicios externos.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "20px",
              background: "#145A32",
              color: "white",
              border: 0,
              borderRadius: "12px",
              padding: "12px 20px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Recargar
          </button>
        </main>
      </body>
    </html>
  );
}
