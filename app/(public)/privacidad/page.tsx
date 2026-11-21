import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Cómo PACHAAGRO trata los datos de productores y el consentimiento para WhatsApp.",
};

export default function PrivacyPage() {
  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-pacha-800 hover:text-pacha-950"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Volver al inicio
      </Link>

      <p className="eyebrow mt-6">
        <LockKeyhole className="h-3.5 w-3.5" aria-hidden />
        Transparencia
      </p>
      <h1 className="mt-4 text-balance text-3xl font-semibold sm:text-4xl">
        Política de privacidad
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink/55">
        Última actualización: noviembre de 2026. Este documento describe el
        tratamiento de datos en la plataforma PACHAAGRO.
      </p>

      <div className="prose-pacha mt-8">
        <h2>1. Datos que recopilamos</h2>
        <p>
          Para crear una cuenta solicitamos nombre, correo electrónico,
          teléfono, departamento, municipio, comunidad (opcional) y cultivos de
          interés. También registramos la fecha de aceptación de los términos y
          del consentimiento de WhatsApp.
        </p>

        <h2>2. Para qué usamos los datos</h2>
        <ul>
          <li>Filtrar anuncios, alertas, reuniones y contenidos por ubicación y cultivo.</li>
          <li>Enviar notificaciones por WhatsApp cuando existe consentimiento explícito.</li>
          <li>Permitir a administradores y asociaciones gestionar la comunicación.</li>
          <li>Mantener registros técnicos de envíos y errores para trazabilidad.</li>
        </ul>

        <h2>3. Consentimiento de WhatsApp</h2>
        <p>
          Los mensajes proactivos solo se envían a personas que activaron la
          opción correspondiente. El consentimiento se registra con fecha. Puedes
          retirarlo respondiendo <strong>BAJA</strong> al número oficial o
          desactivando la opción en tu perfil. La plataforma utiliza únicamente
          la API oficial de WhatsApp Cloud de Meta, nunca automatizaciones no
          oficiales.
        </p>

        <h2>4. Seguridad</h2>
        <p>
          La base de datos aplica Row Level Security. Las claves de servicio y
          los tokens de WhatsApp se mantienen únicamente en variables de entorno
          del servidor y nunca se envían al navegador. Las operaciones
          administrativas se validan por rol en el servidor y en la base de datos.
        </p>

        <h2>5. Conservación y acceso</h2>
        <p>
          Los datos se conservan mientras la cuenta esté activa o según las
          obligaciones aplicables. Puedes solicitar acceso, corrección o
          eliminación de tus datos al administrador de la plataforma. Las
          cuentas de autenticación se gestionan con Supabase Auth.
        </p>

        <h2>6. Contenido y alertas</h2>
        <p>
          PACHAAGRO no sustituye a las autoridades meteorológicas o
          agropecuarias. Los datos identificados como DEMO no son información
          oficial. Las fuentes y fechas de actualización se muestran cuando están
          disponibles.
        </p>

        <h2>7. Contacto</h2>
        <p>
          El canal de contacto y el responsable del tratamiento deben ser
          definidos por el administrador de la plataforma antes de un despliegue
          de producción. No publicamos datos de contacto ficticios.
        </p>
      </div>

      <p className="mt-8 rounded-xl border border-pacha-900/10 bg-pacha-50 px-4 py-3 text-xs text-ink/55">
        Leer también los{" "}
        <Link
          href="/terminos"
          className="font-bold text-pacha-800 underline underline-offset-2"
        >
          términos de uso
        </Link>
        .
      </p>
    </div>
  );
}
