import type { USER_ROLES, USER_STATUSES } from "./constants";

export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES];
export type InternalRoleType = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Parámetros de consulta para listar solicitudes de cuenta de estudiantes por curso.
 */
export type CourseRequestsStudentsPayload = {
  /** Identificador del curso en Moodle. */
  course_id: string;
  /** Identificador del instituto actual. */
  institute: string;
  /** Filtro opcional por estado de la solicitud. */
  status?: UserStatus;
  /** Número de página solicitada (indexada desde 1). */
  page?: number;
  /** Cantidad máxima de registros por página. */
  limit?: number;
  /** Señal opcional para cancelar peticiones obsoletas desde TanStack Query. */
  signal?: AbortSignal;
};

/**
 * Parámetros de consulta para listar solicitudes de cuenta de docentes por instituto.
 */
export type CourseRequestsTeachersPayload = {
  /** Identificador del instituto actual. */
  institute: string;
  /** Filtro opcional por estado de la solicitud. */
  status?: UserStatus;
  /** Número de página solicitada (indexada desde 1). */
  page?: number;
  /** Cantidad máxima de registros por página. */
  limit?: number;
  /** Señal opcional para cancelar peticiones obsoletas desde TanStack Query. */
  signal?: AbortSignal;
};

export type UpdateRequestStatusPayload = {
  institute: string;
  request_id: number;
  newStatus: UserStatus;
  role: InternalRoleType;
};
