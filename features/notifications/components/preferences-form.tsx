"use client";

import { useActionState, useState } from "react";
import { Save } from "lucide-react";
import { updatePreferencesAction } from "@/features/profile/actions";
import { initialActionState } from "@/types/actions";
import type { NotificationPreference } from "@/types/domain";
import { Alert } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";

const items = [
  {
    name: "weatherAlerts",
    label: "Alertas meteorológicas",
    description: "Avisos de heladas, lluvias intensas, vientos y otros eventos.",
  },
  {
    name: "meetingNotices",
    label: "Reuniones y asambleas",
    description: "Convocatorias de tu comunidad y asociación.",
  },
  {
    name: "announcements",
    label: "Anuncios importantes",
    description: "Comunicados agrícolas y avisos de la plataforma.",
  },
  {
    name: "educationalContent",
    label: "Contenido educativo",
    description: "Nuevas guías y fichas de cultivo.",
  },
] as const;

export function PreferencesForm({
  preferences,
  hasPhone,
}: {
  preferences: NotificationPreference;
  hasPhone: boolean;
}) {
  const [state, formAction] = useActionState(
    updatePreferencesAction,
    initialActionState,
  );
  const [optIn, setOptIn] = useState(preferences.whatsappOptIn);

  return (
    <form action={formAction} className="space-y-5">
      {state.status === "success" && <Alert tone="success">{state.message}</Alert>}
      {state.status === "error" && <Alert tone="error">{state.message}</Alert>}

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-pacha-700/20 bg-pacha-50 p-4">
        <Checkbox
          name="whatsappOptIn"
          checked={optIn}
          onChange={(event) => setOptIn(event.target.checked)}
        />
        <span>
          <span className="block text-sm font-bold text-pacha-950">
            Recibir mensajes por WhatsApp
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-ink/60">
            Usaremos tu número {hasPhone ? "registrado" : "(agrega uno en tu perfil)"} para
            enviar alertas y avisos mediante plantillas oficiales. Puedes
            responder <strong>BAJA</strong> en cualquier momento.
          </span>
        </span>
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-bold text-pacha-950">
          ¿Qué información quieres recibir?
        </legend>
        {items.map((item) => (
          <label
            key={item.name}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-pacha-900/10 bg-white p-3.5"
          >
            <Checkbox
              name={item.name}
              defaultChecked={preferences[item.name]}
            />
            <span>
              <span className="block text-sm font-semibold text-pacha-950">
                {item.label}
              </span>
              <span className="mt-0.5 block text-xs text-ink/55">
                {item.description}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-pacha-900/10 bg-mist p-3.5 text-xs leading-relaxed text-ink/65">
        {optIn && <Checkbox name="consent" defaultChecked={preferences.whatsappOptIn} />}
        <span>
          {optIn
            ? "Confirmo mi consentimiento para recibir mensajes de PACHAAGRO por WhatsApp y entiendo que puedo retirarlo respondiendo BAJA o desactivando esta opción."
            : "Al activar WhatsApp se te pedirá confirmar tu consentimiento. Puedes usar la plataforma sin recibir mensajes."}
        </span>
      </label>

      <SubmitButton pendingText="Guardando preferencias…">
        <Save className="h-4 w-4" aria-hidden />
        Guardar preferencias
      </SubmitButton>
    </form>
  );
}
