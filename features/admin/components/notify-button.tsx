"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { notifyAction } from "@/features/admin/actions";
import { initialActionState } from "@/types/actions";
import { SubmitButton } from "@/components/ui/submit-button";

export function NotifyButton({
  kind,
  id,
  label = "Notificar",
}: {
  kind: "announcement" | "weather_alert" | "meeting" | "educational";
  id: string;
  label?: string;
}) {
  const [state, formAction] = useActionState(notifyAction, initialActionState);

  return (
    <form
      action={formAction}
      className="inline-flex flex-col gap-1"
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Se enviará una plantilla de WhatsApp a los usuarios que dieron su consentimiento y coinciden con el alcance. ¿Continuar?",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <SubmitButton
        variant="outline"
        size="sm"
        pendingText="Notificando…"
        className="whitespace-nowrap"
      >
        <Send className="h-3.5 w-3.5" aria-hidden />
        {label}
      </SubmitButton>
      {state.message && (
        <p
          className={`max-w-xs text-[10px] leading-snug ${
            state.status === "error" ? "text-red-700" : "text-pacha-700"
          }`}
          role="status"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
