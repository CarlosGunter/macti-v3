# Módulo APIRouter de Cursos - Proyecto MACTI
#
# Este módulo define los puntos de entrada (endpoints) para la gestión y consulta
# de la oferta académica. Centraliza las rutas relacionadas con el catálogo global
# de Moodle y la vista personalizada de cursos para usuarios autenticados,
# aplicando validaciones de esquema y filtros por instituto.

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.core.db.database import get_db
from app.core.limiter import limiter
from app.core.logging.macti_logger import log_info, log_security_event
from app.modules.courses.controllers.list_courses import ListCoursesController
from app.modules.courses.controllers.user_enrolled_courses import (
    UserEnrolledCoursesController,
)
from app.modules.courses.schemas import (
    CourseResponseSchema,
    UserEnrolledCoursesResponseSchema,
)
from app.shared.dependecies.auth_current_user import CurrentUser, get_current_user
from app.shared.enums.institutes_enum import InstitutesEnum

# Definición del router con prefijo y etiquetas para la documentación automática (Swagger)
router = APIRouter(prefix="/courses", tags=["Cursos"])

LOGGER_NAME = __name__


@router.get(
    "/",
    summary="Listar cursos de Moodle para un instituto específico",
    response_model=list[CourseResponseSchema],
)
@limiter.limit("30/minute")
async def list_courses(
    request: Request,
    institute: InstitutesEnum = Query(..., description="Nombre del instituto (Enum)"),
    ids: list[int] | None = Query(
        None, description="Lista de IDs de cursos para filtrar"
    ),
) -> list[CourseResponseSchema]:
    """
    Endpoint público/administrativo para obtener el catálogo completo de Moodle.

    Permite conocer la oferta académica disponible en una instancia específica
    antes de realizar procesos de inscripción.
    """
    client_ip = request.client.host if request.client else "unknown"
    log_info(
        logger_name=LOGGER_NAME,
        message=f"Consulta de catálogo Moodle iniciada para instituto: {institute.value}",
        extra={
            "institute": institute.value,
            "filter_ids": ids,
            "client_ip": client_ip,
        },
    )

    return await ListCoursesController.list_courses(institute=institute, ids=ids)


@router.get(
    "/enrolled",
    summary="Listar cursos en los que un usuario está inscrito",
    response_model=list[UserEnrolledCoursesResponseSchema],
)
@limiter.limit("20/minute")
async def list_user_enrolled_courses(
    request: Request,
    institute: InstitutesEnum = Query(..., description="Nombre del instituto"),
    user_info: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[UserEnrolledCoursesResponseSchema]:
    """
    Endpoint privado para obtener la 'Mochila Digital' del usuario.

    Requiere un Bearer Token válido. El sistema extrae la identidad del usuario
    del token, resuelve su vinculación con Moodle y retorna sus cursos con
    el rol correspondiente (Maestro/Alumno).
    """
    client_ip = request.client.host if request.client else "unknown"
    log_security_event(
        logger_name=LOGGER_NAME,
        event="consulta_cursos_inscritos",
        user_id=getattr(user_info, "id", None),
        ip=client_ip,
        extra={"institute": institute.value},
    )

    return await UserEnrolledCoursesController.get_user_enrolled_courses(
        institute=institute, user_info=user_info, db=db
    )
