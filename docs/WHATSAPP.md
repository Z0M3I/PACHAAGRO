# WhatsApp Cloud API

PACHAAGRO utiliza **únicamente la API oficial de WhatsApp Cloud de Meta**. No
hay automatizaciones de WhatsApp Web, librerías no oficiales ni sesiones de
navegador.

> **Estado:** la arquitectura, el webhook, el cliente de envío, las plantillas y
> el modo simulación están implementados. No se realizaron envíos reales desde
> este entorno porque no se proporcionaron credenciales de Meta ni un número
> verificado.

---

## 1. Componentes

| Archivo | Responsabilidad |
|---|---|
| `services/whatsapp/meta-client.ts` | Envío de texto/plantillas y errores de Meta |
| `services/whatsapp/templates.ts` | Contratos de plantillas y previsualización |
| `services/whatsapp/commands.ts` | Interpretación de comandos entrantes |
| `services/whatsapp/webhook.ts` | Procesamiento de mensajes y estados |
| `services/whatsapp/messages.ts` | Registro en `whatsapp_messages` y `notification_logs` |
| `services/whatsapp/dispatch.ts` | Segmentación y envío masivo con consentimiento |
| `lib/whatsapp/signature.ts` | Validación HMAC de `X-Hub-Signature-256` |
| `app/api/whatsapp/webhook/route.ts` | GET de verificación y POST firmado |

---

## 2. Variables de entorno

```env
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
```

- `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_APP_SECRET` y la service role **nunca**
  deben llevar prefijo `NEXT_PUBLIC_`.
- `WHATSAPP_VERIFY_TOKEN` lo eliges tú; debe coincidir con el configurado en Meta.
- `WHATSAPP_TEMPLATE_LANGUAGE` debe coincidir con el idioma aprobado de la
  plantilla (`es`, `es_ES`, etc.).
- La API usa `graph.facebook.com/{version}/{phone-number-id}/messages`.

---

## 3. Configuración en Meta

1. Crea una app en [Meta for Developers](https://developers.facebook.com/) de
   tipo **Business**.
2. Agrega el producto **WhatsApp** y vincula una cuenta de WhatsApp Business.
3. Verifica un número de teléfono y obtén:
   - **Phone number ID** → `WHATSAPP_PHONE_NUMBER_ID`.
   - **WhatsApp Business Account ID** → `WHATSAPP_BUSINESS_ACCOUNT_ID`.
   - Token de acceso (temporal para pruebas o System User permanente para
     producción) → `WHATSAPP_ACCESS_TOKEN`.
4. En **App settings → Basic**, copia el **App secret** →
   `WHATSAPP_APP_SECRET`.
5. Configura el webhook:
   - URL: `https://TU_DOMINIO/api/whatsapp/webhook`.
   - Verify token: el mismo de `WHATSAPP_VERIFY_TOKEN`.
   - Suscríbete al campo **messages**.
6. Envía un mensaje de prueba al número para comprobar la recepción.
7. Crea y envía a revisión las cuatro plantillas descritas abajo.

### Verificación del webhook

Meta realizará:

```http
GET /api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
```

La ruta responde con el challenge solo si el token coincide. Si
`WHATSAPP_VERIFY_TOKEN` no está configurado, responde `503`; una verificación
inválida responde `403`.

### Firma del webhook

Cada `POST` debe incluir `X-Hub-Signature-256`. La aplicación calcula
`HMAC-SHA256(rawBody, APP_SECRET)` y compara en tiempo constante. Si
`WHATSAPP_APP_SECRET` falta, responde `503`; una firma inválida responde `401`.
Nunca se procesa un payload sin firma válida.

---

## 4. Plantillas

Los textos siguientes son el **contrato esperado** por el código. Deben coincidir
con las plantillas aprobadas en Meta, incluyendo el orden de las variables.
Usa ejemplos válidos al crear cada plantilla en Business Manager.

### `alerta_climatica_pachaagro`

```text
PACHAAGRO · Alerta
{{1}}
{{2}}
Zona: {{3}}
Vigencia: {{4}}
{{5}}
```

Parámetros: título, descripción, zona, vigencia, enlace + recordatorio de BAJA.

### `reunion_comunitaria_pachaagro`

```text
PACHAAGRO · Reunión
{{1}}
Fecha: {{2}}
Lugar: {{3}}
{{4}}
```

Parámetros: título, fecha, lugar, descripción + enlace + BAJA.

### `anuncio_agricola_pachaagro`

```text
PACHAAGRO · Anuncio
{{1}}
{{2}}
{{3}}
```

Parámetros: título, resumen, enlace + BAJA.

### `contenido_educativo_pachaagro`

```text
PACHAAGRO · Contenido educativo
{{1}}
{{2}}
{{3}}
```

Parámetros: título, resumen, enlace.

> Meta exige plantillas para mensajes iniciados por la empresa. El texto libre
> solo se usa para responder dentro de la ventana de atención de 24 horas.

---

## 5. Comandos

| Entrada | Acción |
|---|---|
| `AYUDA`, `MENU`, `HOLA` | Menú de comandos |
| `CLIMA <municipio>` | Clima actual y pronóstico disponible |
| `CLIMA` | Usa el municipio del perfil |
| `ALERTAS` | Alertas activas de la zona |
| `CULTIVOS` | Cultivos registrados |
| `CONTENIDO` | Últimos contenidos educativos |
| `ALTA` | Activa consentimiento |
| `BAJA`, `STOP` | Desactiva mensajes proactivos |
| Otro texto | Menú de ayuda |

La interpretación ignora mayúsculas, tildes y espacios extra. Si no hay datos
climáticos, el bot responde que no hay información actualizada; no inventa
valores.

Los usuarios se identifican por teléfono normalizado (E.164 sin `+`). Si el
número no está registrado, se responde con instrucciones de registro y no se crea
un perfil automáticamente.

---

## 6. Consentimiento y políticas

- La activación de WhatsApp es **opcional** en el registro y en el perfil.
- El envío proactivo exige `whatsapp_opt_in = true`, `consent_at` no nulo y al
  menos un interés habilitado.
- `BAJA` desactiva los mensajes proactivos y conserva el resto de preferencias.
- No se envían mensajes a números sin perfil registrado.
- El modo simulación también respeta el consentimiento: solo registra
  destinatarios elegibles, pero no contacta a Meta.
- No se almacenan tokens en la base de datos.
- Los logs del servidor no incluyen cuerpos ni teléfonos completos.

---

## 7. Modo simulación

Condición: faltan `WHATSAPP_ACCESS_TOKEN` o `WHATSAPP_PHONE_NUMBER_ID` y
`WHATSAPP_DEMO_MODE` no es `false`.

Comportamiento:

- `sendTemplateMessage`/`sendTextMessage` devuelven
  `{ simulated: true, status: "simulated" }`.
- **No** se realiza ninguna petición HTTP a Meta.
- Se registra el mensaje y el `notification_log` con `is_simulated = true`.
- La UI muestra **SIMULADO** y el panel advierte que no hay credenciales.
- El webhook permanece deshabilitado (`503`) porque no puede verificarse sin
  `APP_SECRET`; no se simula un webhook real.

Si hay credenciales, **nunca** se simula en silencio: un fallo se registra como
`failed` con el error reportado por Meta.

---

## 8. Estados y errores

Estados internos: `queued`, `sent`, `delivered`, `read`, `failed`, `simulated`.

El webhook actualiza `whatsapp_messages` y `notification_logs` por
`wa_message_id`. Meta puede enviar estados fuera de orden; se guarda el último
recibido.

Errores frecuentes:

| Código/situación | Causa probable | Solución |
|---|---|---|
| 190 | Token inválido/expirado | Renovar token de System User |
| 100 | Parámetro o plantilla incorrecta | Revisar nombre, idioma y cantidad de variables |
| 131026 | Número no puede recibir el mensaje | Verificar número/ventana |
| 132000 | Variables no coinciden | Ajustar plantilla y código |
| 132001 | Plantilla inexistente o no aprobada | Revisar Business Manager |
| 401 webhook | Firma inválida | Verificar App Secret y cuerpo crudo |
| 503 webhook | Falta configuración | Definir verify token y app secret |

Para reenviar estados desde Meta, revisa **Webhooks → Recent deliveries** en el
panel de la app.

---

## 9. Prueba manual

### Verificación local del webhook

```bash
curl -i "http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=$WHATSAPP_VERIFY_TOKEN&hub.challenge=12345"
```

Debe devolver `12345` si el token es correcto.

### Firma de un payload

```bash
BODY='{"object":"whatsapp_business_account","entry":[]}'
SIG="sha256=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$WHATSAPP_APP_SECRET" | awk '{print $2}')"

curl -i -X POST http://localhost:3000/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: $SIG" \
  --data "$BODY"
```

### Envío de plantilla (solo con credenciales reales)

```bash
curl -X POST \
  "https://graph.facebook.com/v23.0/$WHATSAPP_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer $WHATSAPP_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "591XXXXXXXX",
    "type": "template",
    "template": {
      "name": "alerta_climatica_pachaagro",
      "language": { "code": "es" },
      "components": [{
        "type": "body",
        "parameters": [
          { "type": "text", "text": "Título" },
          { "type": "text", "text": "Descripción" },
          { "type": "text", "text": "Zona" },
          { "type": "text", "text": "Vigencia" },
          { "type": "text", "text": "https://… · Responde BAJA para no recibir más mensajes." }
        ]
      }]
    }
  }'
```

Reemplaza los valores entre mayúsculas. El número debe estar en formato
internacional sin `+`.

---

## 10. Operación

- **Ventana de 24 horas:** las respuestas libres solo son válidas tras un mensaje
  del usuario. Los avisos proactivos siempre usan plantilla.
- **Límites:** Meta aplica límites por cuenta y calidad. El despacho actual
  procesa hasta 50 destinatarios por acción; para campañas mayores se debe crear
  una cola y monitorear la calidad del número.
- **Idempotencia:** `wa_message_id` es único. Si Meta reintenta un mensaje ya
  procesado, se ignora.
- **Service role:** el webhook no tiene sesión de usuario; requiere
  `SUPABASE_SERVICE_ROLE_KEY` para buscar perfiles y registrar mensajes. Sin esa
  clave, el webhook puede responder pero no identificará usuarios ni guardará
  trazas.
- **Rotación:** rota tokens y App Secret si se exponen. Actualiza Vercel y
  reinicia el despliegue.
- **Observabilidad:** monitorea errores 4xx/5xx, tasa de `failed` y entregas
  recientes en Meta.

---

## 11. Checklist antes de producción

- [ ] Número verificado y mostrado en el perfil de la empresa.
- [ ] Token permanente de System User almacenado solo en Vercel.
- [ ] App Secret configurado y firma validada.
- [ ] Verify token configurado en Meta.
- [ ] Webhook suscrito a `messages`.
- [ ] Cuatro plantillas aprobadas con el idioma correcto.
- [ ] Mensaje de prueba recibido y estado `delivered` visible en el panel.
- [ ] Comando `BAJA` probado con un usuario real.
- [ ] Página de privacidad y canal de contacto publicados.
- [ ] Revisión de políticas de Meta y opt-in documentado.
