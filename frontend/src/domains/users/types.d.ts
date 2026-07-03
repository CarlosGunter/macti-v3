import type { USER_ROLES, USER_STATUSES } from "./constants";

export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES];
export type InternalRoleType = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export type CourseRequestsStudentsPayload = {
  course_id: string;
  institute: string;
  status?: UserStatus;
};

export type CourseRequestsTeachersPayload = {
  institute: string;
  status?: UserStatus;
};

export type UpdateRequestStatusPayload = {
  institute: string;
  request_id: number;
  newStatus: UserStatus;
  role: InternalRoleType;
};
