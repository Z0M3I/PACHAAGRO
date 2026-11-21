"use client";

import { useState } from "react";
import Link from "next/link";
import { useActionState } from "react";
import { Eye, EyeOff, LogIn, Sparkles } from "lucide-react";
import { signInAction } from "@/lib/auth/actions";
import { initialActionState } from "@/types/actions";
import { ROLE_LABELS } from "@/types/actions";
import type { UserRole } from "@/types/domain";
import { Alert } from "@/components/ui/alert";
import { Field, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Badge } from "@/components/ui/badge";

export interface DemoAccount {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export function LoginForm({
  next,
  demoAccounts,
  demoMode,
  initialError,
}: {
  next?: string;
  demoAccounts: DemoAccount[];
  demoMode: boolean;
  initialError?: string;
}) {
  const [state, formAction] = useActionState(signInAction, initialActionState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <p className="eyebrow">Acceso a la plataforma</p>
      <h1 className="mt-4 text-balance font-display text-3xl font-semibold sm:text-4xl">
        Bienvenido de vuelta al campo.
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink/60">
        Ingresa para revisar tus alertas, anuncios, reuniones y contenidos.
      </p>

      {initialError && (
        <Alert tone="error" className="mt-5">
          {initialError}
        </Alert>
      )}
      {state.status === "error" && (
        <Alert tone="error" className="mt-5">
          {state.message}
        </Alert>
      )}

      {demoMode && (
        <div className="mt-5 rounded-2xl border border-gold-500/30 bg-gold-50 p-4">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gold-900">
            <Sparkles className="h-4 w-4" aria-hidden />
            Cuentas de demostración
          </p>
          <p className="mt-1 text-xs leading-relaxed text-gold-900/80">
            Elige un rol para explorar. Los datos son DEMO y las acciones no se
            envían a servicios externos.
          </p>
          <div className="mt-3 grid gap-1.5">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                }}
                className="flex items-center justify-between gap-2 rounded-lg border border-gold-500/20 bg-white px-3 py-2 text-left text-xs transition hover:border-gold-500/50"
              >
                <span>
                  <span className="block font-bold text-pacha-950">
                    {account.fullName}
                  </span>
                  <span className="text-ink/50">{account.email}</span>
                </span>
                <Badge tone={account.role === "admin" ? "gold" : "green"}>
                  {ROLE_LABELS[account.role]}
                </Badge>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-gold-900/60">
            Contraseña compartida: <code>{demoAccounts[0]?.password}</code>
          </p>
        </div>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        {next && <input type="hidden" name="next" value={next} />}
        <Field label="Correo electrónico" htmlFor="email" required>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="tucorreo@ejemplo.bo"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </Field>
        <Field label="Contraseña" htmlFor="password" required>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-0 grid w-10 place-items-center text-ink/40 hover:text-ink/70"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
        </Field>

        <SubmitButton className="w-full" size="lg" pendingText="Ingresando…">
          <LogIn className="h-4 w-4" aria-hidden />
          Iniciar sesión
        </SubmitButton>
      </form>

      <div className="mt-6 flex flex-col gap-2 text-sm text-ink/60">
        <p>
          ¿Todavía no tienes cuenta?{" "}
          <Link
            href="/registro"
            className="font-bold text-pacha-800 underline underline-offset-2"
          >
            Regístrate como productor
          </Link>
        </p>
        <p className="text-xs text-ink/40">
          Si olvidaste tu contraseña, contacta al administrador de tu
          asociación. La recuperación automática se habilitará con el correo
          transaccional configurado.
        </p>
      </div>
    </div>
  );
}
