# Despliegue

## Estado actual

| Elemento | Estado |
|---|---|
| Código y build de producción | ✅ Verificados |
| Repositorio remoto | ✅ `git@github.com:Z0M3I/PACHAAGRO.git` |
| Vercel | ✅ Desplegado en https://pachaagro.vercel.app |
| Supabase remoto | ✅ Proyecto `PACHAAGRO`; 3 migraciones + seed DEMO aplicados |
| Autenticación | ✅ Supabase Auth con cuentas reales y RLS |
| WhatsApp Cloud API | ⚠️ Sin credenciales; modo simulación verificado |
| Clima | ✅ Open-Meteo en vivo; fuente oficial opcional sin configurar |
| Datos | ⚠️ Contenido DEMO identificado; reemplazar antes de uso oficial |

La aplicación está en línea. Las secciones siguientes documentan cómo
reproducir o modificar el despliegue. **No incluir credenciales en Git.**

---

## 1. Requisitos

- Cuenta de GitHub con acceso a `Z0M3I/PACHAAGRO`.
- Cuenta de [Vercel](https://vercel.com).
- Proyecto de [Supabase](https://supabase.com) (plan gratuito suficiente para
  el MVP).
- Para WhatsApp: app de Meta Business con número verificado.
- Node.js 20.9+ y Supabase CLI (opcional, recomendado).

---

## 2. Supabase

### 2.1 Crear proyecto

1. Crea un proyecto en la región más cercana (por ejemplo, `us-east-1` o
   `sa-east-1`).
2. Guarda la contraseña de base de datos en un gestor de secretos.
3. Copia de **Project Settings → API**:
   - Project URL.
   - Anon public key.
   - Service role key (solo servidor).

### 2.2 Aplicar migraciones

Con CLI:

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push --remote
```

Sin CLI:

1. Abre **SQL Editor**.
2. Ejecuta en orden:
   `20261121000100_init.sql`, `20261121000200_rls.sql`,
   `20261121000300_reference_data.sql`.
3. Opcional para una demo: ejecuta `supabase/seed.sql`.

Verifica:

```sql
select count(*) from public.departments;          -- 9
select count(*) from public.municipalities;       -- 32
select tablename, rowsecurity from pg_tables
where schemaname = 'public';                       -- rowsecurity = true
```

### 2.3 Auth

En **Authentication → URL Configuration**:

- Site URL: `https://TU_DOMINIO`.
- Redirect URLs: `https://TU_DOMINIO/auth/callback` y
  `http://localhost:3000/auth/callback`.
- Configura SMTP si quieres confirmación de correo y recuperación de contraseña.
- El registro está habilitado; el trigger crea el perfil como `producer`.

### 2.4 Primer administrador

Crea el usuario desde **Authentication → Users** y ejecuta:

```sql
update public.profiles
set role = 'admin'
where email = 'administrador@dominio.bo';
```

### 2.5 Storage

Las migraciones crean:

- `avatars` (público, 2 MB, JPG/PNG/WebP).
- `educational-assets` (público, 5 MB, imágenes).

Comprueba en **Storage** que ambos buckets existen y que las políticas están
activas.

---

## 3. Vercel

### 3.1 Importar el repositorio

1. En Vercel: **Add New → Project → Import Git Repository**.
2. Selecciona `Z0M3I/PACHAAGRO`.
3. Framework preset: **Next.js**.
4. Build command: `npm run build`. Install: `npm install`.
5. Node.js: 20.x o 22.x.

### 3.2 Variables de entorno

Configura en **Production** (y Preview si corresponde):

```env
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
NEXT_PUBLIC_SITE_NAME=PACHAAGRO

NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
WHATSAPP_API_VERSION=v23.0
WHATSAPP_TEMPLATE_LANGUAGE=es
WHATSAPP_TEMPLATE_ALERT=alerta_climatica_pachaagro
WHATSAPP_TEMPLATE_MEETING=reunion_comunitaria_pachaagro
WHATSAPP_TEMPLATE_ANNOUNCEMENT=anuncio_agricola_pachaagro
WHATSAPP_TEMPLATE_EDUCATION=contenido_educativo_pachaagro
WHATSAPP_DEMO_MODE=true

SENAMHI_API_URL=
SENAMHI_API_KEY=
WEATHER_PRIMARY_PROVIDER=auto
```

Notas:

- No pongas secretos en variables `NEXT_PUBLIC_*`.
- Si dejas WhatsApp vacío y `WHATSAPP_DEMO_MODE=true`, la interfaz mostrará
  simulación y no contactará a Meta.
- Si configuras Supabase, la aplicación sale automáticamente del modo demo.

### 3.3 Desplegar

Haz push a `main` o pulsa **Deploy**. El build no requiere secretos porque el
modo demo permite compilar; las rutas que usan Supabase se resuelven en runtime.

### 3.4 Dominio

1. **Settings → Domains → Add**.
2. Configura el DNS indicado por Vercel.
3. Actualiza `NEXT_PUBLIC_APP_URL` y las Redirect URLs de Supabase con el dominio
   final.
4. Redeploy para regenerar URLs absolutas de notificaciones.

---

## 4. WhatsApp en producción

Sigue [`WHATSAPP.md`](WHATSAPP.md). Resumen:

1. Completa credenciales en Vercel.
2. Verifica el webhook con la URL pública y el verify token.
3. Suscribe el campo `messages`.
4. Aprueba las plantillas con el idioma configurado.
5. Prueba un mensaje real y revisa `/admin/notificaciones`.
6. Confirma que `BAJA` desactiva el consentimiento.

El webhook necesita `SUPABASE_SERVICE_ROLE_KEY` para identificar perfiles y
registrar mensajes sin sesión de usuario.

---

## 5. Clima

- Sin configuración adicional, Open-Meteo funciona como respaldo y la UI lo
  identifica como **no oficial**.
- Para una fuente oficial boliviana, implementa el contrato descrito en
  `services/weather/official.ts` y define `SENAMHI_API_URL` (y `SENAMHI_API_KEY`
  si corresponde).
- `WEATHER_PRIMARY_PROVIDER=official` prioriza la fuente oficial; si falla, el
  sistema puede usar Open-Meteo y lo informa. Usa `open-meteo` para forzar el
  respaldo.
- No se generan alertas a partir del pronóstico. Las alertas son registros
  administrativos con fuente.

---

## 6. CI/CD

`.github/workflows/ci.yml` ejecuta en cada push/PR:

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run test`
5. `npm run build`

Vercel puede conectarse al mismo repositorio y desplegar automáticamente. Se
recomienda proteger `main` y exigir el check de CI antes de fusionar.

---

## 7. Verificación posterior al despliegue

```bash
curl https://TU_DOMINIO/api/health
```

Debe devolver `status: "ok"` y el modo (`demo` o `supabase`).

Checklist:

- [ ] `/` carga con estilos y mapa.
- [ ] `/alertas` y `/biblioteca` muestran datos (o estados vacíos honestos).
- [ ] `/registro` crea un usuario en Supabase y el trigger genera el perfil.
- [ ] El correo de confirmación redirige a `/auth/callback`.
- [ ] Un productor accede a `/panel`; un usuario sin sesión es redirigido.
- [ ] Un productor **no** puede acceder a `/admin`.
- [ ] El administrador ve métricas y puede crear/editar contenido.
- [ ] `/panel/clima` muestra fuente y fecha; al fallar no inventa datos.
- [ ] `/api/whatsapp/webhook` responde al challenge de Meta.
- [ ] Un envío de prueba queda como `simulated` o `sent` según credenciales.
- [ ] `BAJA` en WhatsApp desactiva el consentimiento.
- [ ] Las políticas RLS están activas (`rowsecurity = true`).
- [ ] No hay secretos en el repositorio ni en el bundle del cliente.

---

## 8. Solución de problemas

| Síntoma | Causa probable | Acción |
|---|---|---|
| La app sigue en modo demo | Faltan URL o anon key | Configura ambas y redeploy |
| Login falla en producción | Redirect URL no autorizada | Agrega el dominio en Supabase Auth |
| Perfil no aparece tras registro | Trigger no aplicado | Verifica la migración `init` |
| RLS bloquea una consulta | Falta política o rol | Revisa el rol y la política de la tabla |
| WhatsApp responde 503 | Faltan verify token/app secret | Configura ambos |
| WhatsApp 401 | Firma inválida | Confirma App Secret y cuerpo crudo |
| No se registran mensajes | Falta service role | Configura `SUPABASE_SERVICE_ROLE_KEY` |
| Clima sin datos | Proveedor caído o red | La UI debe mostrar “sin información”; reintenta luego |
| Mapas en blanco | Bloqueo de tiles OSM | Revisa red/CSP del navegador |

---

## 9. Rollback

- **Vercel:** usa **Deployments → Promote** sobre el despliegue anterior.
- **Base de datos:** Supabase PITR o respaldo previo. Las migraciones no se
  revierten automáticamente; crea una migración correctiva.
- **WhatsApp:** desactiva el webhook o rota el token si hay compromiso.
- **Variables:** mantén un registro de cambios; un redeploy es necesario tras
  modificarlas.

---

## 10. Costos y límites del MVP

- Vercel Hobby/Pro y Supabase Free son suficientes para la presentación.
- Open-Meteo no requiere clave para uso no comercial; revisa sus términos si
  escala.
- WhatsApp cobra por conversación según la categoría y el país; verifica tarifas
  vigentes de Meta.
- El rate limit del endpoint climático es en memoria y no se comparte entre
  instancias serverless. Para producción con tráfico real usa un almacén
  distribuido.
