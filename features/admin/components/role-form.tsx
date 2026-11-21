"use client";

import { useActionState } from "react";
import { updateRoleAction } from "@/features/admin/actions";
import { initialActionState } from "@/types/actions";
import type { UserRole } from "@/types/domain";
import { Select } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { ROLE_LABELS } from "@/types/actions";

export function RoleForm({
  profileId,
  currentRole,
  disabled,
}: {
  profileId: string;
  currentRole: UserRole;
  disabled?: boolean;
}) {
  const [state, formAction] = useActionState(
    updateRoleAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="profileId" value={profileId} />
      <Select
        name="role"
        defaultValue={currentRole}
        disabled={disabled}
        className="h-9 w-auto min-w-36 py-1 text-xs"
        aria-label="Rol del usuario"
      >
        {Object.entries(ROLE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <SubmitButton
        variant="outline"
        size="sm"
        pendingText="…"
        disabled={disabled}
      >
        Guardar
      </SubmitButton>
      {state.message && (
        <span
          className={`text-[10px] ${
            state.status === "error" ? "text-red-700" : "text-pacha-700"
          }`}
        >
          {state.message}
        </span>
      )}
    </form>
  );
}
