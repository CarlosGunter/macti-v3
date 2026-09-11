from dataclasses import dataclass

from sqlalchemy.orm import Session

# Logging
from app.core.logging.macti_logger import log_macti_error
from app.modules.register.services.moodle_service import MoodleService
from app.modules.register.use_cases.repositories.enrollment_status_repository import (
    EnrollmentStatusRepository,
)
from app.shared.enums.institutes_enum import InstitutesEnum
from app.shared.enums.role_moodle_enum import RoleEnum
from app.shared.models.student_courses_model import StudentCourseRequest
from app.shared.models.teacher_courses_model import TeacherCourseRequest


@dataclass
class EnrollUserResult:
    enrolled: bool
    error: str | None = None


class EnrollUserUseCase:
    """Orquesta la inscripción de un usuario en un curso"""

    def __init__(
        self,
        moodle_service: MoodleService,
        institute: InstitutesEnum,
        db: Session,
    ):
        self.moodle_service = moodle_service
        self.institute = institute
        self.db = db

    async def execute(
        self,
        request_course_data: TeacherCourseRequest | StudentCourseRequest,
        user_id: int | None = None,
    ) -> EnrollUserResult:
        """Ejecuta el flujo de inscripción de un usuario en un curso específico"""

        auth = request_course_data.auth

        # 1. Resolver el user_id de Moodle
        resolved_user_id = user_id
        if resolved_user_id is None and auth.jids:
            resolved_user_id = auth.jids.moodle_id

        if resolved_user_id is None:
            msg = (
                f"El usuario {auth.email} (ID: {auth.id}) "
                f"no tiene moodle_id asignado en JIDs"
            )
            log_macti_error(
                logger_name="enroll_user_use_case",
                error_code="MOODLE_ID_MISSING",
                message=msg,
                extra={"auth_id": auth.id, "email": auth.email},
            )
            return EnrollUserResult(enrolled=False, error=msg)

        # 2. Determinar los course_ids (crear cursos si es TeacherCourseRequest)
        course_ids: list[int] = []

        if isinstance(request_course_data, StudentCourseRequest):
            course_ids = [request_course_data.moodle_course_id]

        if isinstance(request_course_data, TeacherCourseRequest):
            course_ids = (
                await self._create_courses(request_course_data=request_course_data)
            ) or []
            if not course_ids:
                msg = "Error al crear cursos en Moodle"
                log_macti_error(
                    logger_name="enroll_user_use_case",
                    error_code="COURSE_CREATION_FAILED",
                    message=msg,
                    extra={
                        "auth_id": auth.id,
                        "moodle_id": resolved_user_id,
                        "course_full_name": request_course_data.course_full_name,
                    },
                )
                return EnrollUserResult(enrolled=False, error=msg)

        if not course_ids:
            msg = "No se pudo determinar el ID del curso para la inscripción"
            log_macti_error(
                logger_name="enroll_user_use_case",
                error_code="COURSE_ID_MISSING",
                message=msg,
                extra={"auth_id": auth.id, "moodle_id": resolved_user_id},
            )
            return EnrollUserResult(enrolled=False, error=msg)

        # 3. Resolver rol de Moodle
        moodle_role = self._get_moodle_role_from_account(request_course_data)

        # 4. Inscribir en cada curso
        for course_id in course_ids:
            enrolled = await self.moodle_service.enroll_user(
                user_id=resolved_user_id,
                course_id=course_id,
                institute=self.institute,
                role_id=moodle_role.value,
            )

            if not enrolled.enrolled:
                msg = (
                    f"Fallo al matricular usuario {resolved_user_id} "
                    f"en curso {course_id}"
                )
                log_macti_error(
                    logger_name="enroll_user_use_case",
                    error_code="ENROLLMENT_FAILED",
                    message=msg,
                    extra={
                        "auth_id": auth.id,
                        "moodle_id": resolved_user_id,
                        "course_id": course_id,
                        "role_id": moodle_role.value,
                        "reason": enrolled.error,
                    },
                )
                return EnrollUserResult(enrolled=False, error=enrolled.error)

        # 5. Actualizar el status a ENROLLED
        self._update_request_status_to_enrolled(request_course_data)

        return EnrollUserResult(enrolled=True, error=None)

    def _update_request_status_to_enrolled(
        self,
        request_course_data: StudentCourseRequest | TeacherCourseRequest,
    ) -> None:
        """Actualiza el status de la solicitud a ENROLLED solo si la inscripción fue exitosa."""
        status_repo = EnrollmentStatusRepository(self.db)
        status_repo.mark_as_enrolled(request_course_data)

    def _get_moodle_role_from_account(
        self, request_course_data: TeacherCourseRequest | StudentCourseRequest
    ) -> RoleEnum:
        """Mapea el rol de la aplicación al rol correspondiente en Moodle"""
        if isinstance(request_course_data, TeacherCourseRequest):
            return RoleEnum.EDITING_TEACHER
        if isinstance(request_course_data, StudentCourseRequest):
            return RoleEnum.STUDENT

    async def _create_courses(
        self, request_course_data: TeacherCourseRequest
    ) -> list[int] | None:
        """Crea cursos en Moodle basado en la información de la solicitud"""

        groups_list = [
            g.strip() for g in request_course_data.groups.split(",") if g.strip()
        ]
        if not groups_list:
            groups_list = ["General"]

        course_creation_result = await self.moodle_service.create_courses(
            institute=self.institute,
            fullname=request_course_data.course_full_name,
            groups=groups_list,
        )
        if course_creation_result.error:
            return None

        return course_creation_result.course_ids
