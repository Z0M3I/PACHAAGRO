import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, isSupabaseConfigured } from "@/lib/env";

/**
 * Cliente con service role. Solo debe usarse en el servidor para:
 * - Webhooks de WhatsApp (no hay sesión de usuario).
 * - Registro de notificaciones y mensajes.
 * - Tareas administrativas puntuales que ya validaron el rol.
 *
 * NUNCA importar este archivo desde un componente de cliente.
 */
export function createSupabaseAdminClient(): SupabaseClient | null {
  if (
    !isSupabaseConfigured ||
    !env.supabaseUrl ||
    !env.supabaseServiceRoleKey
  ) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
