"use client";

import { useActionState } from "react";
import { ImageUp, KeyRound } from "lucide-react";
import {
  changePasswordAction,
  uploadAvatarAction,
} from "@/features/profile/actions";
import { initialActionState } from "@/types/actions";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";

export function AvatarForm({ disabled }: { disabled: boolean }) {
  const [state, formAction] = useActionState(
    uploadAvatarAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="space-y-3">
      {state.status === "error" && <Alert tone="error">{state.message}</Alert>}
      {state.status === "success" && <Alert tone="success">{state.message}</Alert>}
      <div>
        <label htmlFor="avatar" className="field-label">
          Foto de perfil
        </label>
        <input
          id="avatar"
          name="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled}
          className="block w-full text-xs text-ink/60 file:mr-3 file:rounded-lg file:border-0 file:bg-pacha-100 file:px-3 file:py-2 file:text-xs file:font-bold file:text-pacha-900 hover:file:bg-pacha-200 disabled:opacity-50"
        />
        <p className="field-help">JPG, PNG o WebP · máximo 2 MB.</p>
      </div>
      <SubmitButton
        variant="outline"
        size="sm"
        pendingText="Subiendo…"
        disabled={disabled}
      >
        <ImageUp className="h-4 w-4" aria-hidden />
        Subir foto
      </SubmitButton>
      {disabled && (
        <p className="text-[11px] text-ink/40">
          Requiere Supabase Storage. Deshabilitado en modo demostración.
        </p>
      )}
    </form>
  );
}

export function PasswordForm({ disabled }: { disabled: boolean }) {
  const [state, formAction] = useActionState(
    changePasswordAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="space-y-3">
      {state.status === "error" && <Alert tone="error">{state.message}</Alert>}
      {state.status === "success" && <Alert tone="success">{state.message}</Alert>}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className="field-label">
            Nueva contraseña
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            disabled={disabled}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="field-label">
            Confirmar contraseña
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            disabled={disabled}
            required
          />
        </div>
      </div>
      <p className="field-help">
        Mínimo 8 caracteres, con al menos una letra y un número.
      </p>
      <SubmitButton
        variant="outline"
        size="sm"
        pendingText="Actualizando…"
        disabled={disabled}
      >
        <KeyRound className="h-4 w-4" aria-hidden />
        Cambiar contraseña
      </SubmitButton>
      {disabled && (
        <p className="text-[11px] text-ink/40">
          Requiere Supabase Auth. Deshabilitado en modo demostración.
        </p>
      )}
    </form>
  );
}
