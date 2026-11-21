import type { UserRole } from "@/types/domain";

export interface ActionState {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export const initialActionState: ActionState = {
  status: "idle",
  message: "",
};

export function success(message: string): ActionState {
  return { status: "success", message };
}

export function failure(
  message: string,
  fieldErrors?: Record<string, string[] | undefined>,
): ActionState {
  return { status: "error", message, fieldErrors };
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  producer: "Productor agrícola",
  association_manager: "Responsable de asociación",
  content_editor: "Editor de contenido",
};

export const STAFF_ROLES: UserRole[] = [
  "admin",
  "association_manager",
  "content_editor",
];

export const CONTENT_ROLES: UserRole[] = ["admin", "content_editor"];
