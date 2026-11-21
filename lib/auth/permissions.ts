import type { UserRole } from "@/types/domain";

export function isAdminRole(role: UserRole | null | undefined): boolean {
  return role === "admin";
}

export function isStaffRole(role: UserRole | null | undefined): boolean {
  return (
    role === "admin" ||
    role === "association_manager" ||
    role === "content_editor"
  );
}

export function canManageContent(role: UserRole | null | undefined): boolean {
  return role === "admin" || role === "content_editor";
}

export function canManageAnnouncements(
  role: UserRole | null | undefined,
): boolean {
  return role === "admin" || role === "content_editor";
}

export function canManageMeetings(role: UserRole | null | undefined): boolean {
  return isStaffRole(role);
}

export function canManageAlerts(role: UserRole | null | undefined): boolean {
  return role === "admin";
}

export function canManageUsers(role: UserRole | null | undefined): boolean {
  return role === "admin";
}

export function canViewAdminPanel(role: UserRole | null | undefined): boolean {
  return role === "admin" || role === "content_editor";
}

export function canManageReferenceData(
  role: UserRole | null | undefined,
): boolean {
  return role === "admin";
}

export function adminHomeForRole(role: UserRole): string {
  return canViewAdminPanel(role) ? "/admin" : "/panel";
}
