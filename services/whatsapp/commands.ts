export type WhatsAppCommandKind =
  | "help"
  | "weather"
  | "alerts"
  | "crops"
  | "content"
  | "opt_in"
  | "opt_out"
  | "unknown";

export interface WhatsAppCommand {
  kind: WhatsAppCommandKind;
  argument: string;
}

/**
 * Interpreta comandos sencillos enviados por WhatsApp.
 * No depende de mayúsculas, tildes ni espacios extra.
 */
export function interpretWhatsAppCommand(raw: string): WhatsAppCommand {
  const normalized = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

  if (!normalized) return { kind: "unknown", argument: "" };

  const [first = "", ...rest] = normalized.split(/\s+/);
  const argument = rest.join(" ").trim();

  switch (first) {
    case "AYUDA":
    case "MENU":
    case "HOLA":
    case "BUENOS":
    case "BUENAS":
    case "START":
      return { kind: "help", argument: "" };
    case "CLIMA":
    case "PRONOSTICO":
    case "TIEMPO":
      return { kind: "weather", argument };
    case "ALERTA":
    case "ALERTAS":
      return { kind: "alerts", argument: "" };
    case "CULTIVO":
    case "CULTIVOS":
      return { kind: "crops", argument: "" };
    case "CONTENIDO":
    case "CONTENIDOS":
    case "EDUCACION":
    case "GUIA":
    case "GUIAS":
      return { kind: "content", argument: "" };
    case "ALTA":
    case "ACTIVAR":
    case "SUSCRIBIR":
      return { kind: "opt_in", argument: "" };
    case "BAJA":
    case "STOP":
    case "DESACTIVAR":
    case "CANCELAR":
      return { kind: "opt_out", argument: "" };
    default:
      return { kind: "unknown", argument: "" };
  }
}

export function helpMessage(): string {
  return [
    "PACHAAGRO 🌱",
    "Comandos disponibles:",
    "• CLIMA <municipio> — clima actual y pronóstico",
    "• ALERTAS — alertas activas en tu zona",
    "• CULTIVOS — tus cultivos registrados",
    "• CONTENIDO — guías educativas recientes",
    "• ALTA / BAJA — activar o desactivar notificaciones",
    "",
    "Escribe AYUDA para ver este menú.",
  ].join("\n");
}
