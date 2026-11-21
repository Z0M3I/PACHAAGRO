import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "/panel";
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/panel";

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=confirmacion", request.url),
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(
      new URL("/login?error=configuracion", request.url),
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=confirmacion", request.url),
    );
  }

  return NextResponse.redirect(new URL(safeNext, request.url));
}
