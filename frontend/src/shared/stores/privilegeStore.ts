import { create } from "zustand";
import {
  getPrivilegeLevelFromRole,
  type PrivilegeLevel,
  type RoleType,
} from "@/shared/config/rolesMap";

export type { PrivilegeLevel, RoleType };

export interface PrivilegeState {
  /**
   * Nivel de privilegio del usuario: "high" o "low" (o null si aún no se ha determinado).
   */
  privilegeLevel: PrivilegeLevel | null;

  /**
   * Rol o roles asignados al usuario (ej. "manager", "student", etc.).
   */
  roles: string[];

  /**
   * Establece directamente el nivel de privilegio ("high" o "low").
   */
  setPrivilegeLevel: (level: PrivilegeLevel | null) => void;

  /**
   * Establece un rol único y calcula automáticamente el nivel de privilegio según rolesMap.
   */
  setRole: (role: string | null) => void;

  /**
   * Establece múltiples roles y calcula automáticamente el nivel de privilegio ("high" si alguno lo es).
   */
  setRoles: (roles: string[]) => void;

  /**
   * Agrega uno o más roles de manera acumulativa evitando duplicados mediante Set,
   * y recalculando el nivel de privilegio global.
   */
  addRoles: (newRoles: string[]) => void;

  /**
   * Reinicia el estado global de privilegios.
   */
  reset: () => void;
}

export const usePrivilegeStore = create<PrivilegeState>((set) => ({
  privilegeLevel: null,
  roles: [],

  setPrivilegeLevel: (level) =>
    set({
      privilegeLevel: level,
    }),

  setRole: (role) =>
    set({
      roles: role ? [role] : [],
      privilegeLevel: role ? getPrivilegeLevelFromRole(role) : null,
    }),

  setRoles: (roles) => {
    const uniqueRoles = Array.from(new Set(roles.map((r) => r.toLowerCase().trim())));
    return set({
      roles: uniqueRoles,
      privilegeLevel: getPrivilegeLevelFromRole(uniqueRoles),
    });
  },

  addRoles: (newRoles) =>
    set((state) => {
      const cleanNewRoles = newRoles.map((r) => r.toLowerCase().trim());
      const uniqueRolesSet = new Set([...state.roles, ...cleanNewRoles]);
      const updatedRoles = Array.from(uniqueRolesSet);

      return {
        roles: updatedRoles,
        privilegeLevel: getPrivilegeLevelFromRole(updatedRoles),
      };
    }),

  reset: () =>
    set({
      privilegeLevel: null,
      roles: [],
    }),
}));
