import type { NotificationStatus } from "@/types/domain";
import { Badge } from "@/components/ui/badge";

const labels: Record<NotificationStatus, string> = {
  queued: "En cola",
  sent: "Enviado",
  delivered: "Entregado",
  read: "Leído",
  failed: "Falló",
  simulated: "Simulado",
};

const tones: Record<
  NotificationStatus,
  "green" | "gold" | "red" | "neutral" | "blue"
> = {
  queued: "neutral",
  sent: "blue",
  delivered: "green",
  read: "green",
  failed: "red",
  simulated: "gold",
};

export function StatusBadge({ status }: { status: NotificationStatus }) {
  return <Badge tone={tones[status]}>{labels[status]}</Badge>;
}
