"""Repositorio para la consulta de solicitudes de cuenta visibles."""

from typing import Any

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session
from sqlalchemy.sql.elements import ColumnElement
from sqlalchemy.sql.selectable import Select

from app.shared.enums.institutes_enum import InstitutesEnum
from app.shared.enums.role_enum import AccountRoleEnum
from app.shared.enums.status_enum import RequestStatusEnum
from app.shared.models.auth_model import Auth
from app.shared.models.student_courses_model import StudentCourseRequest
from app.shared.models.user_profiles_model import UserProfile


class ListAccountRequestsRepository:
    """Encapsula la lectura de solicitudes de cuenta de alumnos."""

    def __init__(self, db: Session):
        """Inicializa el repositorio con la sesión activa de base de datos."""
        self.db = db

    def list_student_account_requests(
        self,
        course_id: int,
        institute: InstitutesEnum,
        status: RequestStatusEnum | None = None,
        page: int = 1,
        limit: int = 10,
    ) -> tuple[list[dict[str, Any]], int]:
        """
        Retorna las solicitudes de alumnos paginadas junto con el total de registros encontrados.
        """
        filters = self._build_filters(
            course_id=course_id,
            institute=institute,
            status=status,
        )

        # 1. Conteo total con los filtros aplicados
        count_stmt = (
            select(func.count(StudentCourseRequest.id))
            .join(Auth, StudentCourseRequest.auth_id == Auth.id)
            .join(UserProfile, UserProfile.auth_id == Auth.id)
            .where(*filters)
        )
        total = self.db.execute(count_stmt).scalar() or 0

        # 2. Consulta paginada con offset y limit
        stmt = self._build_statement(
            filters=filters,
            page=page,
            limit=limit,
        )

        rows = self.db.execute(stmt).mappings().all()
        return [dict(row) for row in rows], total

    def _build_statement(
        self,
        filters: list[ColumnElement[bool]],
        page: int,
        limit: int,
    ) -> Select[tuple[int, int, str, str, str, RequestStatusEnum, AccountRoleEnum]]:
        """Construye la consulta con ordenamiento y paginación para solicitudes de alumnos."""
        status_order = self._build_status_order()
        offset = (page - 1) * limit

        return (
            select(
                StudentCourseRequest.id.label("id"),
                Auth.id.label("user_id"),
                UserProfile.name.label("name"),
                UserProfile.last_name.label("last_name"),
                Auth.email.label("email"),
                StudentCourseRequest.status.label("status"),
                UserProfile.role.label("role"),
            )
            .join(Auth, StudentCourseRequest.auth_id == Auth.id)
            .join(UserProfile, UserProfile.auth_id == Auth.id)
            .where(*filters)
            .order_by(status_order, StudentCourseRequest.id.desc())
            .offset(offset)
            .limit(limit)
        )

    @staticmethod
    def _build_status_order() -> ColumnElement[int]:
        """Define el orden de prioridad para el estatus de las solicitudes."""
        return case(
            (StudentCourseRequest.status == RequestStatusEnum.PENDING, 0),
            (StudentCourseRequest.status == RequestStatusEnum.APPROVED, 1),
            (StudentCourseRequest.status == RequestStatusEnum.REJECTED, 2),
            (StudentCourseRequest.status == RequestStatusEnum.ENROLLED, 3),
            else_=4,
        )

    @staticmethod
    def _build_filters(
        course_id: int,
        institute: InstitutesEnum,
        status: RequestStatusEnum | None,
    ) -> list[ColumnElement[bool]]:
        """Construye los filtros base de la consulta."""
        filters: list[ColumnElement[bool]] = [
            Auth.institute == institute,
            StudentCourseRequest.moodle_course_id == course_id,
            UserProfile.role == AccountRoleEnum.ALUMNO,
        ]

        if status is not None:
            filters.append(StudentCourseRequest.status == status)

        return filters