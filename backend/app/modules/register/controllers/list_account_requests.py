"""Controlador para listar solicitudes de cuenta visibles para un usuario."""

from typing import Annotated

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db.database import get_db
from app.modules.register.repositories.list_account_requests_repository import (
    ListAccountRequestsRepository,
)
from app.shared.enums.institutes_enum import InstitutesEnum
from app.shared.enums.status_enum import RequestStatusEnum
from app.shared.schemas.pagination import PaginatedResponse


class ListAccountRequestsController:
    """
    Controlador encargado de orquestar la consulta de solicitudes de cuenta
    visibles para el usuario actual.
    """

    def __init__(self, db: Annotated[Session, Depends(get_db)]) -> None:
        """
        Inicializa el controlador inyectando la sesión de base de datos y su repositorio.

        Args:
            db: Sesión activa de SQLAlchemy inyectada por FastAPI.
        """
        self.db = db
        self.repository = ListAccountRequestsRepository(db)

    async def list_accounts_requests(
        self,
        course_id: int,
        institute: InstitutesEnum,
        status: RequestStatusEnum | None = None,
        page: int = 1,
        limit: int = 10,
    ) -> PaginatedResponse:
        """
        Obtiene solicitudes de cuenta paginadas y filtradas por curso, instituto y estado.

        Args:
            course_id: Identificador del curso en Moodle.
            institute: Instituto al que pertenece la solicitud.
            status: Filtro opcional por estatus.
            page: Número de página.
            limit: Límite por página.

        Returns:
            PaginatedResponse: Lista paginada con metadatos de conteo.
        """
        items, total = self._list_account_requests_or_raise(
            course_id=course_id,
            institute=institute,
            status=status,
            page=page,
            limit=limit,
        )

        return PaginatedResponse.create(
            items=items,
            total=total,
            page=page,
            limit=limit,
        )

    def _list_account_requests_or_raise(
        self,
        course_id: int,
        institute: InstitutesEnum,
        status: RequestStatusEnum | None,
        page: int,
        limit: int,
    ) -> tuple[list[dict[str, object]], int]:
        """Delega al repositorio la consulta de solicitudes visibles con paginación."""
        try:
            return self.repository.list_student_account_requests(
                course_id=course_id,
                institute=institute,
                status=status,
                page=page,
                limit=limit,
            )
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail={
                    "error_code": "OBTENCION_SOLICITUDES_FALLIDA",
                    "message": "Hubo un error al obtener las solicitudes de cuenta. Intente nuevamente más tarde.",
                },
            ) from exc
