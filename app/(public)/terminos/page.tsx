import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileCheck2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Términos de uso",
  description:
    "Condiciones de uso de PACHAAGRO, límites del contenido agrícola y responsabilidades.",
};

export default function TermsPage() {
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
        <FileCheck2 className="h-3.5 w-3.5" aria-hidden />
        Condiciones
      </p>
      <h1 className="mt-4 text-balance text-3xl font-semibold sm:text-4xl">
        Términos de uso
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink/55">
        Última actualización: noviembre de 2026.
      </p>

      <div className="prose-pacha mt-8">
        <h2>1. Objeto</h2>
        <p>
          PACHAAGRO es una plataforma de comunicación y educación agrícola para
          Bolivia. Facilita la difusión de anuncios, alertas, reuniones y
          contenidos educativos. No es un servicio de emergencia ni una autoridad
          meteorológica o sanitaria.
        </p>

        <h2>2. Contenido informativo</h2>
        <p>
          Las guías agrícolas son de orientación general. No constituyen
          instrucciones oficiales ni reemplazan la asistencia de un profesional
          autorizado. Antes de aplicar insumos, tratamientos o cambios de manejo,
          verifica la normativa vigente y consulta a un técnico.
        </p>
        <p>
          Las alertas y pronósticos muestran su fuente y fecha cuando están
          disponibles. Si una fuente falla, la plataforma informa la ausencia de
          datos y no genera valores estimados.
        </p>

        <h2>3. Cuentas y roles</h2>
        <p>
          Cada persona es responsable de la veracidad de sus datos y de mantener
          segura su contraseña. Los roles administrativos se asignan de forma
          restringida. Está prohibido intentar acceder a funciones para las que no
          se tiene autorización.
        </p>

        <h2>4. Uso aceptable</h2>
        <ul>
          <li>No publicar información falsa, discriminatoria o ilegal.</li>
          <li>No suplantar a autoridades, asociaciones o personas.</li>
          <li>No usar la plataforma para spam ni mensajes no consentidos.</li>
          <li>No intentar vulnerar la seguridad o la privacidad de otras personas.</li>
        </ul>

        <h2>5. WhatsApp</h2>
        <p>
          Los mensajes proactivos requieren consentimiento y el uso de plantillas
          aprobadas por Meta cuando corresponda. La plataforma no utiliza
          automatizaciones no oficiales. El usuario puede darse de baja
          respondiendo BAJA.
        </p>

        <h2>6. Disponibilidad</h2>
        <p>
          La plataforma puede depender de servicios externos como Supabase,
          Vercel, Open-Meteo y WhatsApp Cloud API. No se garantiza disponibilidad
          ininterrumpida. Las interrupciones se documentarán cuando sea posible.
        </p>

        <h2>7. Propiedad intelectual</h2>
        <p>
          La identidad visual y el código de PACHAAGRO se distribuyen según la
          licencia del repositorio. Los contenidos de terceros conservan sus
          propios derechos y deben citarse en las notas de fuente.
        </p>

        <h2>8. Datos personales</h2>
        <p>
          El tratamiento de datos se describe en la{" "}
          <Link href="/privacidad">política de privacidad</Link>. El
          consentimiento de WhatsApp puede retirarse en cualquier momento.
        </p>

        <h2>9. Modificaciones</h2>
        <p>
          Estos términos pueden actualizarse para reflejar cambios en la
          plataforma o en la normativa. La fecha de actualización se mostrará en
          esta página.
        </p>
      </div>
    </div>
  );
}
