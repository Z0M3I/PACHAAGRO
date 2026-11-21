# Contribución

Gracias por mejorar PACHAAGRO. Este documento define cómo trabajamos para
mantener el proyecto seguro, comprensible y desplegable.

---

## 1. Flujo de Git

- Rama principal: `main` (protegida).
- Ramas de trabajo: `feature/<tema>`, `fix/<tema>`, `docs/<tema>`,
  `chore/<tema>`.
- La rama activa del MVP es `feature/pachaagro-mvp`.
- **No** se permite `git push --force` ni `git reset --hard`.
- Antes de empezar:

```bash
git fetch origin
git status
git log --oneline -10
```

- Sincroniza con `git pull --rebase origin main` si tu rama está desactualizada.
- Si hay conflictos, detente, analiza ambos lados y resuelve manualmente.
- No elimines cambios de otras personas sin acordarlo.

### Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat: crear landing page de PACHAAGRO
feat: implementar autenticación de usuarios
feat: agregar centro de comunicación
feat: implementar biblioteca agrícola
feat: integrar módulo meteorológico
feat: preparar bot de WhatsApp
fix: corregir validación de perfiles
test: agregar pruebas de segmentación
docs: documentar arquitectura
chore: configurar CI
```

Reglas:

- Un commit = un cambio coherente.
- Mensaje en imperativo, en español, sin punto final.
- No incluir secretos, `.env.local`, capturas con datos personales ni artefactos
  de build.
- Si el cambio requiere migración, inclúyela en el mismo commit o en uno
  inmediatamente posterior.

---

## 2. Requisitos locales

- Node.js 20.9+.
- npm.
- Opcional: Supabase CLI y Docker para base de datos local.

```bash
npm install
npm run dev
```

Sin credenciales, la aplicación funciona en modo demostración.

---

## 3. Estándares de código

- TypeScript estricto; evitar `any` (el lint lo prohíbe).
- Server Components por defecto; `"use client"` solo cuando se necesita estado,
  efectos o APIs del navegador.
- Componentes pequeños y con una responsabilidad.
- Lógica de negocio en `features/` o `services/`, no en JSX.
- Validación con Zod en el límite del servidor.
- Server Actions para formularios; Route Handlers para integraciones y APIs.
- Errores visibles para el usuario; nunca mostrar tokens, stack traces ni SQL.
- Textos en español claro, con tildes.
- Mantener la identidad visual: tipografía, paleta, radios, etiquetas DEMO.

### Nombres

- Archivos y carpetas: `kebab-case`.
- Componentes y tipos: `PascalCase`.
- Funciones y variables: `camelCase`.
- Tablas y columnas SQL: `snake_case`.
- Enums de PostgreSQL: `snake_case`.

### Accesibilidad

- Todo control tiene etiqueta o `aria-label`.
- Mantener contraste y foco visible.
- Usar landmarks (`header`, `nav`, `main`, `footer`).
- No transmitir información solo por color.
- Probar navegación con teclado y zoom al 200 %.

---

## 4. Añadir una funcionalidad

Ejemplo: nuevo tipo de contenido.

1. **Dominio:** actualiza `types/domain.ts` e `types/inputs.ts`.
2. **SQL:** crea una migración nueva; si agregas un enum, usa `alter type ... add
   value` en una migración separada.
3. **Servicios:** actualiza `services/` y `services/mappers.ts`.
4. **Validación:** agrega el esquema Zod.
5. **UI:** reutiliza `components/ui`; crea el formulario en `features/`.
6. **Autorización:** revisa layouts, actions y RLS.
7. **Pruebas:** agrega casos en `tests/`.
8. **Documentación:** actualiza README y docs si cambia el modelo o el flujo.
9. **Verificación:** `npm run verify`.

### Cambios de base de datos

- Nunca edites una migración aplicada.
- Nombra el archivo con timestamp: `YYYYMMDDHHMMSS_descripcion.sql`.
- Incluye políticas RLS para tablas nuevas.
- Añade índices para columnas filtradas o unidas.
- Actualiza el seed solo si el dato es DEMO y está marcado.
- Documenta el cambio en `docs/BASE_DE_DATOS.md`.

---

## 5. Seguridad

Antes de abrir un PR:

- [ ] No hay secretos en código, tests, capturas ni commits.
- [ ] Toda tabla nueva tiene RLS y políticas.
- [ ] Las acciones sensibles validan el rol en el servidor.
- [ ] Los inputs se validan con Zod y se normalizan.
- [ ] Las URLs externas usan `https` y `rel="noopener noreferrer"`.
- [ ] Los errores no filtran datos personales.
- [ ] Los webhooks validan firma y son idempotentes.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` solo se usa en servidor.
- [ ] Los cambios de rol no permiten autoelevación.

Si encuentras una vulnerabilidad, no abras un issue público con datos
explotables. Contacta al mantenedor del repositorio.

---

## 6. Pruebas

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Cobertura actual de pruebas unitarias:

- Validación de registro/perfil y consentimiento.
- Validación de publicaciones, alcance y contenido.
- Segmentación por departamento, municipio, comunidad y cultivo.
- Firma HMAC del webhook y parseo de payload.
- Comandos del bot.
- Condiciones WMO, normalización de teléfonos, slugs y fechas.
- Integridad de los datos DEMO.

Añade una prueba cuando:

- Cambie una regla de negocio.
- Se corrija un bug.
- Se agregue un parser, validador o cálculo.
- Se modifique la seguridad o el alcance de datos.

Para pruebas end-to-end se recomienda Playwright (pendiente): login, registro,
CRUD administrativo, consentimiento y flujo del bot.

---

## 7. Documentación

Actualiza según corresponda:

- `README.md`: inicio rápido, variables, estado.
- `docs/ARQUITECTURA.md`: capas, flujos, decisiones.
- `docs/BASE_DE_DATOS.md`: tablas, RLS, migraciones.
- `docs/WHATSAPP.md`: plantillas, comandos, configuración de Meta.
- `docs/DESPLIEGUE.md`: variables, Vercel, Supabase.
- `docs/CONTRIBUCION.md`: proceso.

Documenta lo que falta con honestidad. No declares una integración como
funcional si no se probó con credenciales reales.

---

## 8. Pull Request

Título sugerido:

```text
feat: agregar recordatorios de reuniones por WhatsApp
```

Descripción:

```markdown
## Qué cambia
...

## Por qué
...

## Cómo probar
1. ...
2. ...

## Seguridad
- [ ] RLS revisado
- [ ] Roles validados
- [ ] Sin secretos

## Capturas
(si aplica)

## Checklist
- [ ] lint
- [ ] typecheck
- [ ] tests
- [ ] build
- [ ] docs
```

El PR debe pasar CI. No se fusiona con conflictos ni con checks rojos. No se
reescribe el historial de otros colaboradores.

---

## 9. Convención de datos DEMO

- Todo registro de ejemplo debe tener `is_demo = true`.
- La UI debe mostrar la etiqueta **DEMO**.
- Las alertas demo no deben presentarse como oficiales.
- No usar nombres de personas reales sin consentimiento.
- No incluir teléfonos, correos ni direcciones reales en seeds.

---

## 10. Licencia

Al contribuir aceptas que tu aporte se distribuya bajo la licencia MIT del
repositorio.
