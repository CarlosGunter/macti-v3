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
    "/clear-user",
    summary="Eliminar todos los datos relacionados con un usuario específico",
)
async def clear_user_data(
    user_id: int = Query(
        ...,
        description="ID del usuario (Auth) cuyos datos serán eliminados de la BD y servicios externos",
    ),
    db: Session = Depends(get_db),
):
    """
    Realiza una limpieza total de un usuario para permitir re-pruebas de registro.

    Operaciones:
    1. Localiza el registro en la base de datos local (Auth) con sus identificadores externos (JIDs).
    2. Elimina la identidad del usuario en Keycloak (IAM) si existe.
    3. Elimina la identidad del usuario en Moodle (LMS) si existe y limpia su caché en Redis.
    4. Elimina físicamente el registro en la tabla Auth (la eliminación en cascada remueve
       perfil, tokens, solicitudes y JIDs).
    """
    # 1. Validación de existencia y obtención de contexto
    user_auth = (
        db.query(Auth)
        .options(joinedload(Auth.jids))
        .filter(Auth.id == user_id)
        .one_or_none()
    )
    if not user_auth:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {user_id} no encontrado en la base de datos local.",
        )

    institute = user_auth.institute
    email = user_auth.email

    # Obtener IDs externos almacenados en BD si existen
    kc_id: UUID | None = user_auth.jids.kc_id if user_auth.jids else None
    moodle_id: int | None = user_auth.jids.moodle_id if user_auth.jids else None

    # 2. Eliminación en el Proveedor de Identidad (Keycloak)
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

    kc_deleted = True
    kc_error = None
    if kc_id:
        del_kc = await KeycloakService.delete_user(user_id=kc_id, institute=institute)
        if not del_kc.deleted and "404" not in str(del_kc.error):
            kc_deleted = False
            kc_error = del_kc.error

    # 3. Eliminación en Moodle (LMS)
    # Si no se tiene moodle_id en JIDs, intentar buscar por email en Moodle
    if not moodle_id:
        moodle_id = await SharedMoodleService.get_user_by_email(
            email=email, institute=institute
        )

    moodle_deleted = True
    moodle_error = None
    if moodle_id:
        del_moodle = await RegisterMoodleService.delete_user(
            user_id=moodle_id, institute=institute
        )
        if (
            not del_moodle.deleted
            and "invaliduser" not in str(del_moodle.error).lower()
        ):
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
            logger.warning(f"No se pudo invalidar la clave de Redis para {email}: {e}")

    # 4. Persistencia de la eliminación local (Hard Delete de Auth y relaciones en cascada)
    try:
        db.delete(user_auth)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al eliminar los registros en la base de datos.",
        ) from e

    # 5. Notificación de posibles inconsistencias en servicios externos
    if not kc_deleted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Datos locales borrados, pero falló la eliminación en Keycloak: {kc_error}",
        )

    if not moodle_deleted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Datos locales borrados, pero falló la eliminación en Moodle: {moodle_error}",
        )

    return {
        "message": f"Usuario {user_id} ({email}) eliminado exitosamente de MACTI, Keycloak y Moodle."
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
