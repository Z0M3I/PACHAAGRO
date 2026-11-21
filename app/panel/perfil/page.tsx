import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sprout,
  UserRound,
} from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/env";
import {
  getCommunities,
  getCrops,
  getDepartments,
  getMunicipalities,
} from "@/services/reference";
import { ProfileForm } from "@/features/profile/components/profile-form";
import {
  AvatarForm,
  PasswordForm,
} from "@/features/profile/components/account-forms";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/empty-state";
import { ROLE_LABELS } from "@/types/actions";
import { formatDate, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function ProfilePage() {
  const user = await requireUser("/panel/perfil");
  const [departments, municipalities, communities, crops] = await Promise.all([
    getDepartments(),
    getMunicipalities(),
    getCommunities(),
    getCrops(),
  ]);

  const cropNames = crops
    .filter((crop) => user.cropIds.includes(crop.id))
    .map((crop) => crop.name);

  return (
    <div>
      <PageHeader
        eyebrow="Cuenta y preferencias"
        title="Mi perfil"
        description="Mantén tus datos actualizados para recibir información de tu zona y tus cultivos."
        actions={
          <Link
            href="/panel/notificaciones"
            className="inline-flex items-center gap-1.5 rounded-xl border border-pacha-900/15 bg-white px-3.5 py-2 text-xs font-bold text-pacha-900"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Notificaciones
          </Link>
        }
      />

      {isDemoMode && (
        <Alert tone="warning" className="mb-5">
          Estás en modo demostración. Los cambios se conservan solo mientras el
          servidor esté activo y no se sincronizan con Supabase.
        </Alert>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <Card>
          <CardHeader
            icon={<UserRound className="h-4.5 w-4.5" />}
            title="Datos del productor"
            description="La ubicación y los cultivos permiten filtrar la información."
          />
          <CardBody>
            <ProfileForm
              user={user}
              departments={departments}
              municipalities={municipalities}
              communities={communities}
              crops={crops}
            />
          </CardBody>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={`Foto de ${user.fullName}`}
                    width={56}
                    height={56}
                    unoptimized
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-pacha-800 text-sm font-bold text-white">
                    {initials(user.fullName)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-semibold">
                    {user.fullName}
                  </p>
                  <Badge tone={user.isDemo ? "gold" : "green"}>
                    {user.isDemo ? "DEMO · " : ""}
                    {ROLE_LABELS[user.role]}
                  </Badge>
                </div>
              </div>

              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 text-pacha-700" aria-hidden />
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wide text-ink/40">
                      Correo
                    </dt>
                    <dd className="break-all">{user.email ?? "No registrado"}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 text-pacha-700" aria-hidden />
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wide text-ink/40">
                      Teléfono
                    </dt>
                    <dd>{user.phone ?? "No registrado"}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-pacha-700" aria-hidden />
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wide text-ink/40">
                      Ubicación
                    </dt>
                    <dd>
                      {[user.communityName, user.municipalityName, user.departmentName]
                        .filter(Boolean)
                        .join(", ") || "Sin configurar"}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarDays className="mt-0.5 h-4 w-4 text-pacha-700" aria-hidden />
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wide text-ink/40">
                      Miembro desde
                    </dt>
                    <dd>{formatDate(user.createdAt)}</dd>
                  </div>
                </div>
              </dl>

              <div className="mt-4 border-t border-pacha-900/8 pt-3">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-ink/40">
                  <Sprout className="h-3.5 w-3.5" aria-hidden />
                  Cultivos
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {cropNames.length > 0 ? (
                    cropNames.map((name) => (
                      <Badge key={name} tone="neutral">
                        {name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-ink/45">Sin cultivos</span>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Foto de perfil" icon={<BadgeCheck className="h-4.5 w-4.5" />} />
            <CardBody>
              <AvatarForm disabled={isDemoMode} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Seguridad"
              icon={<ShieldCheck className="h-4.5 w-4.5" />}
            />
            <CardBody>
              <PasswordForm disabled={isDemoMode} />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
