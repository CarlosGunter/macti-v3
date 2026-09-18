# Módulo TempRouter - Utilidades de Depuración y Pruebas
#
# Este router agrupa endpoints temporales diseñados para facilitar el ciclo de
# desarrollo. Incluye herramientas para la limpieza profunda de datos (Hard Delete),
# verificación de integridad de tokens JWT y consultas directas a servicios externos.
# Nota: Este módulo debería ser deshabilitado o protegido en entornos de producción.

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.encoders import jsonable_encoder
from loguru import logger
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.cache.redis_client import redis_client
from app.core.db.database import get_db
from app.modules.register.services.kc_service import KeycloakService
from app.modules.register.services.moodle_service import (
    MoodleService as RegisterMoodleService,
)
from app.shared.dependecies.auth_current_user import get_current_user
from app.shared.dependecies.auth_scope_course_manager import ScopeCourseManager
from app.shared.dependecies.auth_scopes_base import AuthScopes
from app.shared.enums.institutes_enum import InstitutesEnum
from app.shared.enums.role_enum import AccountRoleEnum
from app.shared.models.auth_model import Auth
from app.shared.models.student_courses_model import StudentCourseRequest
from app.shared.models.teacher_courses_model import TeacherCourseRequest
from app.shared.services.moodle_service import MoodleService as SharedMoodleService

router = APIRouter(prefix="/temp", tags=["temp"])


@router.get(
    "/jwt-test",
    summary="Endpoint de prueba para verificar el token JWT Bearer y obtener información del usuario actual",
)
async def bearer_test(current_user=Depends(get_current_user)):
    """
    Valida la correcta configuración del Middleware de Seguridad.

    Si el token es válido, retorna la información decodificada del usuario
    (Payload del JWT). Utiliza 'jsonable_encoder' para serializar el objeto
    de usuario actual.
    """
    return {
        "message": "Autenticación exitosa. El token Bearer es válido.",
        "user": jsonable_encoder(current_user, by_alias=False),
    }


@router.delete(
    "/clear-users",
    summary="Eliminar datos de un usuario en base de datos local y plataformas seleccionadas",
)
@router.delete(
    "/clear-user",
    summary="Eliminar datos de un usuario en base de datos local y plataformas seleccionadas (alias)",
)
async def clear_user_data(
    *,
    user_id: int | None = Query(
        None,
        description="ID del usuario (Auth.id) o ID de solicitud (StudentCourseRequest.id / TeacherCourseRequest.id)",
    ),
    email: str | None = Query(
        None,
        description="Email del usuario cuyos datos serán eliminados de la BD y/o servicios externos",
    ),
    institute: InstitutesEnum | None = Query(
        None,
        description="Instituto al que pertenece el usuario (opcional si se especifica email único o user_id)",
    ),
    delete_keycloak: bool = Query(
        default=True,
        description="Indica si se debe eliminar la cuenta del usuario en Keycloak (IAM)",
    ),
    delete_moodle: bool = Query(
        default=True,
        description="Indica si se debe eliminar la cuenta del usuario en Moodle (LMS)",
    ),
    delete_local: bool = Query(
        default=True,
        description="Indica si se debe eliminar el registro en la base de datos local (Auth y cascada)",
    ),
    db: Session = Depends(get_db),
):
    """
    Realiza la limpieza de un usuario en la base de datos local y/o plataformas externas seleccionadas.

    Permite identificar al usuario por su 'email' (con 'institute' opcional) o por su 'user_id'.
    Si se proporciona 'user_id' y no coincide directamente con un Auth.id, buscará automáticamente
    si corresponde al ID de una solicitud de alumno (StudentCourseRequest) o docente (TeacherCourseRequest).

    Opciones de eliminación por plataforma:
    - delete_keycloak: Si es True, elimina la identidad del usuario en Keycloak (IAM).
    - delete_moodle: Si es True, elimina al usuario en Moodle (LMS) e invalida su caché en Redis.
    - delete_local: Si es True, elimina físicamente el registro en la tabla Auth (la cascada
      remueve perfil, tokens, solicitudes y JIDs).
    """
    if not user_id and not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debe proporcionar al menos 'user_id' o 'email' para identificar al usuario a eliminar.",
        )

    if not delete_keycloak and not delete_moodle and not delete_local:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debe seleccionar al menos una plataforma o la base de datos local para eliminar.",
        )

    # 1. Validación de existencia y obtención de contexto
    user_auth = None

    # Búsqueda por email
    if email:
        email_clean = email.strip().lower()
        query = (
            db.query(Auth)
            .options(joinedload(Auth.jids))
            .filter(func.lower(Auth.email) == email_clean)
        )
        if institute:
            query = query.filter(Auth.institute == institute)
        user_auth = query.first()

    # Búsqueda por user_id si no se encontró por email o solo se pasó user_id
    if not user_auth and user_id is not None:
        user_auth = (
            db.query(Auth)
            .options(joinedload(Auth.jids))
            .filter(Auth.id == user_id)
            .one_or_none()
        )

        # Fallback 1: Si no se encuentra en Auth, buscar si user_id es ID de una solicitud de alumno
        if not user_auth:
            student_req = (
                db.query(StudentCourseRequest)
                .filter(StudentCourseRequest.id == user_id)
                .one_or_none()
            )
            if student_req:
                user_auth = (
                    db.query(Auth)
                    .options(joinedload(Auth.jids))
                    .filter(Auth.id == student_req.auth_id)
                    .one_or_none()
                )

        # Fallback 2: Buscar si user_id es ID de una solicitud de docente
        if not user_auth:
            teacher_req = (
                db.query(TeacherCourseRequest)
                .filter(TeacherCourseRequest.id == user_id)
                .one_or_none()
            )
            if teacher_req:
                user_auth = (
                    db.query(Auth)
                    .options(joinedload(Auth.jids))
                    .filter(Auth.id == teacher_req.auth_id)
                    .one_or_none()
                )

    if not user_auth:
        identifier = f"email '{email}'" if email else f"ID {user_id}"
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con {identifier} no encontrado en la base de datos local.",
        )

    actual_user_id = user_auth.id
    institute = user_auth.institute
    email = user_auth.email

    # Obtener IDs externos almacenados en BD si existen
    kc_id: UUID | None = user_auth.jids.kc_id if user_auth.jids else None
    moodle_id: int | None = user_auth.jids.moodle_id if user_auth.jids else None

    # 2. Eliminación en el Proveedor de Identidad (Keycloak)
    kc_deleted = False
    kc_error = None
    if delete_keycloak:
        # Si no se tiene kc_id en JIDs, intentar buscar por email en Keycloak
        if not kc_id:
            kc_lookup = await KeycloakService.get_user_by_email(
                email=email, institute=institute
            )
            if kc_lookup.found and kc_lookup.user and "id" in kc_lookup.user:
                try:
                    kc_id = UUID(str(kc_lookup.user["id"]))
                except (ValueError, TypeError):
                    kc_id = None

        if kc_id:
            del_kc = await KeycloakService.delete_user(
                user_id=kc_id, institute=institute
            )
            if del_kc.deleted or "404" in str(del_kc.error):
                kc_deleted = True
            else:
                kc_deleted = False
                kc_error = del_kc.error
        else:
            kc_deleted = True

    # 3. Eliminación en Moodle (LMS)
    moodle_deleted = False
    moodle_error = None
    if delete_moodle:
        # Si no se tiene moodle_id en JIDs, intentar buscar por email en Moodle
        if not moodle_id:
            moodle_id = await SharedMoodleService.get_user_by_email(
                email=email, institute=institute
            )

        if moodle_id:
            del_moodle = await RegisterMoodleService.delete_user(
                user_id=moodle_id, institute=institute
            )
            if del_moodle.deleted or "invaliduser" in str(del_moodle.error).lower():
                moodle_deleted = True
            else:
                moodle_deleted = False
                moodle_error = del_moodle.error

            # Invalida caché de Redis asociado al usuario
            try:
                cache_key = redis_client.build_key(
                    "user_profile_by_email",
                    institute=institute.value,
                    email=email.lower(),
                )
                await redis_client.delete(cache_key)
            except Exception as e:
                logger.warning(
                    f"No se pudo invalidar la clave de Redis para {email}: {e}"
                )
        else:
            moodle_deleted = True

    # 4. Persistencia de la eliminación local (Hard Delete de Auth y relaciones en cascada)
    local_deleted = False
    if delete_local:
        try:
            db.delete(user_auth)
            db.commit()
            local_deleted = True
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al eliminar los registros en la base de datos.",
            ) from e

    # 5. Notificación de posibles inconsistencias en servicios externos solicitados
    if delete_keycloak and not kc_deleted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falló la eliminación en Keycloak: {kc_error}",
        )

    if delete_moodle and not moodle_deleted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falló la eliminación en Moodle: {moodle_error}",
        )

    deleted_targets = []
    if delete_local and local_deleted:
        deleted_targets.append("BD local")
    if delete_keycloak and kc_deleted:
        deleted_targets.append("Keycloak")
    if delete_moodle and moodle_deleted:
        deleted_targets.append("Moodle")

    targets_str = (
        ", ".join(deleted_targets) if deleted_targets else "Ninguna plataforma"
    )

    return {
        "message": f"Limpieza completada para el usuario {actual_user_id} ({email}). Eliminado de: {targets_str}.",
        "details": {
            "user_id": actual_user_id,
            "email": email,
            "institute": institute.value,
            "keycloak": {
                "requested": delete_keycloak,
                "deleted": kc_deleted if delete_keycloak else False,
                "error": kc_error,
            },
            "moodle": {
                "requested": delete_moodle,
                "deleted": moodle_deleted if delete_moodle else False,
                "error": moodle_error,
            },
            "local_db": {
                "requested": delete_local,
                "deleted": local_deleted,
            },
        },
    }


# @router.get(
#     "/user-moodle-info",
#     summary="Obtener información del usuario actual por su email",
# )
# async def get_user_info(
#     institute: InstitutesEnum = Query(
#         ..., description="Instituto al que pertenece el usuario"
#     ),
#     email: str = Query(..., description="Email registrado en Moodle"),
# ):
#     """
#     Consulta directa al Web Service de Moodle para depurar perfiles.

#     Permite verificar si un usuario existe en el LMS y qué datos (IDs, roles)
#     está retornando Moodle antes de integrarlos en la lógica de negocio principal.
#     """
#     return await MoodleService.get_user_profile_by_email(
#         institute=institute, user_email=email
#     )


@router.get(
    "/list-manager-accounts",
    summary="Listar cuentas de administradores por instituto",
)
async def list_manager_accounts(
    institute: InstitutesEnum = Query(
        ..., description="Instituto para filtrar cuentas de administradores"
    ),
):
    """Endpoint de prueba para listar cuentas de administradores por instituto."""
    return await SharedMoodleService.get_admins(institute=institute)


@router.get(
    "/admin-permissions",
    summary="Verificar permisos de administrador para el usuario actual",
)
async def check_admin_permissions(_=Depends(AuthScopes(AccountRoleEnum.ADMIN))):
    """
    Endpoint de prueba para verificar si el usuario actual tiene permisos de administrador.
    """
    return {"message": "El usuario tiene permisos de administrador."}


@router.get(
    "/course-manager-permissions",
    summary="Verificar permisos de gestor de curso para el usuario actual",
)
async def check_course_manager_permissions(
    institute: InstitutesEnum = Query(..., description="Instituto"),
    course_id: int = Query(..., description="ID del curso en Moodle"),
    _=Depends(ScopeCourseManager()),
):
    """
    Endpoint de prueba para verificar si el usuario actual tiene permisos de gestor de curso.
    """
    # Aquí se podría agregar lógica adicional para verificar roles específicos en el curso
    return {
        "message": "El usuario tiene permisos de gestor de curso.",
        "institute": institute,
        "course_id": course_id,
    }
