export const rolesMap: Record<string, string> = {
  manager: "manager",
  coursecreator: "coursecreator",
  editingteacher: "editingteacher",
  teacher: "teacher",
  student: "student",
  guest: "guest",
  user: "user",
  frontpage: "frontpage",
};

// Roles agrupados por privilegio
export const privilegeRoles: Record<"high" | "low", string[]> = {
  high: ["manager", "coursecreator", "editingteacher", "teacher"],
  low: ["student", "guest", "user", "frontpage"],
};
