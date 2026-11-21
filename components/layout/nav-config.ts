import type { UserRole } from "@/types/domain";

export interface NavItem {
  href: string;
  label: string;
  icon:
    | "home"
    | "megaphone"
    | "calendar"
    | "cloud"
    | "book"
    | "bell"
    | "user"
    | "dashboard"
    | "users"
    | "send"
    | "shield";
  exact?: boolean;
}

export function panelNav(): NavItem[] {
  return [
    { href: "/panel", label: "Inicio", icon: "home", exact: true },
    { href: "/panel/anuncios", label: "Anuncios", icon: "megaphone" },
    { href: "/panel/reuniones", label: "Reuniones", icon: "calendar" },
    { href: "/panel/clima", label: "Clima y alertas", icon: "cloud" },
    { href: "/panel/biblioteca", label: "Biblioteca", icon: "book" },
    { href: "/panel/notificaciones", label: "Notificaciones", icon: "bell" },
    { href: "/panel/perfil", label: "Mi perfil", icon: "user" },
  ];
}

export function adminNav(role: UserRole): NavItem[] {
  const items: NavItem[] = [
    { href: "/admin", label: "Resumen", icon: "dashboard", exact: true },
    { href: "/admin/publicaciones", label: "Publicaciones", icon: "megaphone" },
  ];

  if (role === "admin") {
    items.push(
      { href: "/admin/alertas", label: "Alertas", icon: "cloud" },
      { href: "/admin/reuniones", label: "Reuniones", icon: "calendar" },
    );
  }

  items.push({ href: "/admin/biblioteca", label: "Biblioteca", icon: "book" });

  if (role === "admin") {
    items.push(
      { href: "/admin/usuarios", label: "Usuarios", icon: "users" },
      { href: "/admin/notificaciones", label: "Notificaciones", icon: "send" },
    );
  }

  return items;
}
