"""Controlador para listar solicitudes de cuenta de docentes."""

from typing import Annotated, Any

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.db.database import get_db
from app.modules.register.repositories.list_account_requests_teacher_repository import (
    ListTeacherAccountRequestsRepository,
)
from app.shared.enums.institutes_enum import InstitutesEnum
from app.shared.enums.status_enum import RequestStatusEnum
from app.shared.schemas.pagination import PaginatedResponse


class AccountRequestsTeacherController:
    """Controlador para la consulta de solicitudes de cuenta de docentes."""

    def __init__(self, db: Annotated[Session, Depends(get_db)]) -> None:
        """
        Inicializa el controlador inyectando la sesión de base de datos y su repositorio.

        Args:
            db: Sesión activa de SQLAlchemy inyectada por FastAPI.
        """
        self.db = db
        self.repository = ListTeacherAccountRequestsRepository(db)

    async def list_teacher_accounts_requests(
        self,
        institute: InstitutesEnum,
        status: RequestStatusEnum | None = None,
        page: int = 1,
        limit: int = 10,
    ) -> PaginatedResponse:
        """Obtiene la lista paginada de solicitudes de docentes visibles para un administrador."""
        rows, total = self._get_teacher_requests_or_raise(
            institute=institute,
            status=status,
            page=page,
            limit=limit,
        )
        built_items = self._build_response(rows)
        return PaginatedResponse.create(
            items=built_items,
            total=total,
            page=page,
            limit=limit,
        )

    def _get_teacher_requests_or_raise(
        self,
        institute: InstitutesEnum,
        status: RequestStatusEnum | None,
        page: int,
        limit: int,
    ) -> tuple[list[dict[str, Any]], int]:
        """Obtiene las solicitudes docentes paginadas desde el repositorio."""
        return self.repository.list_teacher_account_requests(
            institute=institute,
            status=status,
            page=page,
            limit=limit,
        )

    def _build_response(self, rows: list[dict[str, Any]]) -> list[dict[str, object]]:
        """Convierte los registros crudos en la estructura pública de respuesta."""
        return [
            {
                "user": self._build_user_payload(row),
                "courses": self._build_course_payload(row),
            }
            for row in rows
        ]

    def _build_user_payload(self, row: dict[str, Any]) -> dict[str, object]:
        """Construye el bloque user de la respuesta."""
        return {
            "id": row["user_id"],
            "name": row["name"],
            "last_name": row["last_name"],
            "email": row["email"],
            "role": row["role"],
            "institute": row["institute"],
        }

    def _build_course_payload(self, row: dict[str, Any]) -> dict[str, object]:
        """Construye el bloque courses de la respuesta."""
        return {
            "id": row["course_request_id"],
            "status": row["status"],
            "course_full_name": row["course_full_name"],
            "groups": self._split_groups(row["groups"]),
        }

    def _split_groups(self, groups: str | None) -> list[str]:
        """Convierte los grupos almacenados como CSV en una lista limpia."""
        return [group.strip() for group in (groups or "").split(",") if group.strip()]
