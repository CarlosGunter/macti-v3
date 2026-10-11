export const rolesMap = {
  manager: "manager",
  coursecreator: "coursecreator",
  editingteacher: "editingteacher",
  teacher: "teacher",
  student: "student",
  guest: "guest",
  user: "user",
  frontpage: "frontpage",
} as const;

export type RoleType = keyof typeof rolesMap;

// Roles agrupados por privilegio
export const privilegeRoles: Record<"high" | "low", readonly string[]> = {
  high: ["manager", "coursecreator", "editingteacher", "teacher"],
  low: ["student", "guest", "user", "frontpage"],
};

export type PrivilegeLevel = keyof typeof privilegeRoles; // "high" | "low"

/**
 * Determina el nivel de privilegio ("high" o "low") para un rol dado o lista de roles según rolesMap.
 * Si algún rol está en la lista de privilegios altos, se considera "high".
 */
export function getPrivilegeLevelFromRole(
  role: string | string[] | null | undefined,
): PrivilegeLevel | null {
  if (!role) return null;

  const roles = Array.isArray(role) ? role : [role];
  if (roles.length === 0) return null;

  const hasHigh = roles.some((r) =>
    (privilegeRoles.high as readonly string[]).includes(r.toLowerCase()),
  );
  if (hasHigh) return "high";

  const hasLow = roles.some((r) =>
    (privilegeRoles.low as readonly string[]).includes(r.toLowerCase()),
  );
  if (hasLow) return "low";

  return null;
}
