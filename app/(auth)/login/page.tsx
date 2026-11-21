import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/env";
import { demoAccounts } from "@/lib/demo-data";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

interface PageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

const errorMessages: Record<string, string> = {
  confirmacion:
    "No pudimos confirmar tu correo. Solicita un nuevo enlace o inicia sesión.",
  configuracion:
    "La autenticación no está configurada. Revisa las variables de Supabase.",
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect(user.role === "admin" || user.role === "content_editor" ? "/admin" : "/panel");

  return (
    <LoginForm
      next={params.next}
      demoMode={isDemoMode}
      initialError={params.error ? errorMessages[params.error] : undefined}
      demoAccounts={
        isDemoMode
          ? demoAccounts.map((account) => ({
              fullName: account.fullName,
              email: account.email ?? "",
              password: account.password,
              role: account.role,
            }))
          : []
      }
    />
  );
}
