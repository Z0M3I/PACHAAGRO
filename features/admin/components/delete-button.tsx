"use client";

import { Trash2 } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";

export function DeleteButton({
  action,
  label = "Eliminar",
  confirmMessage = "¿Eliminar este registro? Esta acción no se puede deshacer.",
}: {
  action: (formData: FormData) => Promise<void>;
  label?: string;
  confirmMessage?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
    >
      <SubmitButton
        variant="ghost"
        size="sm"
        pendingText="Eliminando…"
        className="text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        {label}
      </SubmitButton>
    </form>
  );
}
