/**
 * Cantidad máxima de solicitudes de cuenta solicitadas por página.
 * Coincide con el valor por defecto del backend (`limit = 10`).
 */
export const ACCOUNT_REQUESTS_PAGE_LIMIT = 10;

export const USER_STATUSES = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  ENROLLED: "enrolled",
});

export const STATUS_BTN_LABELS = Object.freeze({
  pending: "Pendiente",
  approved: "Aprobar",
  rejected: "Rechazar",
  enrolled: "Eliminar",
});

export const STATUS_BADGE_LABELS = Object.freeze({
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
  enrolled: "Inscrito",
});

export const USER_ROLES = Object.freeze({
  STUDENT: "alumno",
  TEACHER: "docente",
});
