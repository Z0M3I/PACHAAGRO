import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getCommunities,
  getCrops,
  getDepartments,
  getMunicipalities,
} from "@/services/reference";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Crear cuenta de productor",
};

export default async function RegisterPage() {
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect("/panel");

  const [departments, municipalities, communities, crops] = await Promise.all([
    getDepartments(),
    getMunicipalities(),
    getCommunities(),
    getCrops(),
  ]);

  return (
    <RegisterForm
      departments={departments}
      municipalities={municipalities}
      communities={communities}
      crops={crops}
      demoMode={isDemoMode}
    />
  );
}
