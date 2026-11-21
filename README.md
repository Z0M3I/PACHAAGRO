# PACHAAGRO

**Conectando al productor con la información que necesita.**

Plataforma web de comunicación y educación agrícola para Bolivia. Organiza
alertas, anuncios comunitarios, reuniones, contenido educativo y consultas
climáticas por **departamento, municipio, comunidad y cultivo**, con una
integración preparada para la **API oficial de WhatsApp Cloud de Meta**.

> **Estado del despliegue:** el proyecto está preparado para Vercel + Supabase,
> pero **no se ha desplegado** desde este entorno porque no se proporcionaron
> credenciales. Los pasos exactos están en [`docs/DESPLIEGUE.md`](docs/DESPLIEGUE.md).

---

## Lo que incluye

- **Página pública** con identidad visual propia, cobertura nacional con
  Leaflet/OpenStreetMap, alertas, biblioteca y presentación del bot.
- **Autenticación y perfiles** con cuatro roles: administrador, productor,
  responsable de asociación y editor de contenido.
- **Centro de comunicación** con anuncios, comunicados, alertas, reuniones y
  eventos segmentados por alcance geográfico o cultivo.
- **Biblioteca educativa** filtrable por cultivo, departamento, categoría y
  tipo. Todo contenido incluye nota de fuente y advertencia de alcance.
- **Clima y alertas** con proveedor desacoplado. Si no hay datos, se informa la
  ausencia; nunca se inventan pronósticos.
- **WhatsApp Cloud API** con verificación de firma, webhook, comandos,
  plantillas, consentimiento, bajas y registro de estados. Sin credenciales
  opera en **modo simulación** y lo declara explícitamente.
- **Panel administrativo** con métricas, CRUD de publicaciones, alertas,
  reuniones y contenidos, gestión de roles e historial de notificaciones.
- **Supabase** con migraciones versionadas, RLS, triggers antiescalada,
  Storage para avatares y datos DEMO identificados.
- **Modo demostración** completo cuando faltan credenciales de Supabase.
- **Pruebas unitarias**, lint, TypeScript estricto, build de producción y CI.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide |
| Backend | Route Handlers y Server Actions de Next.js, Zod |
| Base de datos | Supabase / PostgreSQL, Auth, Storage, Row Level Security |
| Mapas | Leaflet + OpenStreetMap (`react-leaflet`) |
| Clima | Open-Meteo como respaldo + adaptador para fuente oficial boliviana |
| Mensajería | WhatsApp Cloud API oficial de Meta |
| Pruebas | Vitest |
| Despliegue previsto | Vercel + Supabase |

---

## Inicio rápido (modo demostración, sin credenciales)

Requisitos: Node.js **20.9+** (probado con Node 22/26) y npm.

```bash
git clone git@github.com:Z0M3I/PACHAAGRO.git
cd PACHAAGRO
npm install
cp .env.example .env.local   # opcional: sin cambios arranca en modo demo
npm run dev
```

Abre `http://localhost:3000`.

### Cuentas DEMO

Todas usan la contraseña `DemoPacha2026!` (visible también en la pantalla de
acceso en modo demostración):

| Rol | Correo |
|---|---|
| Administrador | `admin@pachaagro.bo` |
| Productor agrícola | `productor@pachaagro.bo` |
| Responsable de asociación | `asociacion@pachaagro.bo` |
| Editor de contenido | `editor@pachaagro.bo` |

> En modo demo los datos viven en memoria del proceso. Las acciones
> administrativas funcionan para demostrar el flujo, pero **no persisten** y
> **no se envían mensajes reales**. La interfaz lo indica en cada pantalla.

También puedes crear una cuenta nueva desde `/registro`; la sesión demo se
mantiene mientras el servidor esté activo.

---

## Configuración real con Supabase

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Aplica las migraciones de `supabase/migrations/` (en orden) con la CLI o el
   SQL Editor. Opcionalmente ejecuta `supabase/seed.sql` para cargar contenido
   DEMO identificado.
3. Copia `.env.example` a `.env.local` y completa:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y
   `SUPABASE_SERVICE_ROLE_KEY`.
4. Configura Auth: confirma correo si lo deseas y agrega
   `https://TU_DOMINIO/auth/callback` como URL de redirección.
5. Crea el primer usuario desde Supabase Auth y promuévelo a administrador:

```sql
update public.profiles
set role = 'admin'
where email = 'tu-correo@dominio.bo';
```

El detalle de tablas, RLS y Storage está en
[`docs/BASE_DE_DATOS.md`](docs/BASE_DE_DATOS.md).

---

## Variables de entorno

| Variable | Obligatoria | Uso |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | producción | URLs absolutas de notificaciones y correo |
| `NEXT_PUBLIC_SUPABASE_URL` | para modo real | endpoint del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | para modo real | clave pública sujeta a RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | webhooks | escritura de logs y lectura de perfiles desde el servidor |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp real | token de Meta (solo servidor) |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp real | identificador del número |
| `WHATSAPP_VERIFY_TOKEN` | webhook | verificación GET de Meta |
| `WHATSAPP_APP_SECRET` | webhook | validación HMAC de la firma |
| `WHATSAPP_DEMO_MODE` | no | permite simulación si faltan credenciales |
| `WHATSAPP_TEMPLATE_*` | WhatsApp real | nombres de plantillas aprobadas |
| `SENAMHI_API_URL` / `SENAMHI_API_KEY` | opcional | fuente oficial boliviana normalizada |
| `WEATHER_PRIMARY_PROVIDER` | opcional | `auto`, `official` u `open-meteo` |

Los secretos **nunca** llevan el prefijo `NEXT_PUBLIC_` ni se guardan en la base
de datos. Ver `.env.example`.

---

## Scripts

```bash
npm run dev        # desarrollo
npm run build      # build de producción
npm run start      # servir el build
npm run lint       # ESLint
npm run typecheck  # TypeScript estricto
npm run test       # Vitest
npm run verify     # lint + typecheck + test + build
```

Verificación ejecutada en este repositorio:

- `npm run lint` → sin errores.
- `npm run typecheck` → sin errores.
- `npm run test` → **34 pruebas aprobadas**.
- `npm run build` → build de producción correcto para todas las rutas.
- Smoke test de producción: páginas públicas, panel de productor, admin y API
  de clima responden correctamente; las rutas privadas redirigen sin sesión;
  el webhook responde `503` cuando no está configurado.

---

## Estructura

```text
app/                    rutas App Router
  (public)/             landing, alertas, biblioteca, cobertura, WhatsApp, legales
  (auth)/               login y registro
  panel/                experiencia del productor
  admin/                panel administrativo
  api/                  clima, salud y webhook de WhatsApp
  auth/callback/        intercambio de código de Supabase Auth
components/             UI reutilizable, layout, tarjetas, mapas
features/               lógica por funcionalidad (auth, admin, perfil, clima, notificaciones)
lib/                    env, auth, validación, Supabase, utilidades, demo
services/               acceso a datos, mappers, clima, WhatsApp
supabase/               migraciones SQL versionadas + seed DEMO
types/                  tipos de dominio
tests/                  pruebas unitarias
docs/                   arquitectura, BD, WhatsApp, despliegue, contribución
```

---

## Seguridad

- RLS habilitado en todas las tablas de negocio.
- Roles validados en servidor **y** en PostgreSQL; trigger que impide
  autoelevación de rol.
- Webhook de WhatsApp con HMAC SHA-256 (`X-Hub-Signature-256`).
- Zod en formularios y endpoints; validación de jerarquía
  departamento → municipio → comunidad.
- `service_role` solo en el servidor; nunca en el cliente.
- Cabeceras de seguridad y rutas privadas protegidas por middleware y layouts.
- Contraseñas y tokens fuera del repositorio.

---

## Integraciones y transparencia

- **Clima:** Open-Meteo se usa como respaldo internacional y se identifica como
  **no oficial**. Existe un adaptador `SENAMHI_API_URL` que espera un contrato
  normalizado; no se inventó ni se afirma que SENAMHI exponga una API pública
  con ese formato. Si no hay datos, se muestra “sin información actualizada”.
- **WhatsApp:** solo API oficial. Sin credenciales se registra `simulado`, nunca
  “enviado”. Los mensajes proactivos requieren plantillas aprobadas y
  consentimiento. Ver [`docs/WHATSAPP.md`](docs/WHATSAPP.md).
- **Datos DEMO:** se muestran con etiqueta. No son alertas, pronósticos ni
  comunicados oficiales.

---

## Documentación

- [Arquitectura](docs/ARQUITECTURA.md)
- [Base de datos](docs/BASE_DE_DATOS.md)
- [WhatsApp Cloud API](docs/WHATSAPP.md)
- [Despliegue](docs/DESPLIEGUE.md)
- [Contribución](docs/CONTRIBUCION.md)

---

## Licencia

MIT. Ver [`LICENSE`](LICENSE).
