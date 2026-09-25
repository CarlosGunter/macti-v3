"""
Service for interacting with Moodle LMS API - Project MACTI
"""

import hashlib
from dataclasses import dataclass, field
from types import SimpleNamespace

from app.core.cache.redis_client import redis_client
from app.core.logging.macti_logger import log_info, log_service_error
from app.shared.config.moodle_configs import MOODLE_CONFIG
from app.shared.enums.institutes_enum import InstitutesEnum
from app.shared.enums.role_moodle_enum import RoleEnum
from app.shared.services.moodle_client import make_moodle_request

LOGGER_NAME = "moodle_service"


@dataclass
class GetAdminsResult:
    success: bool
    error_message: str | None = None
    admins: list = field(default_factory=list)


class MoodleService:
    """
    Clase estática que centraliza las operaciones de lectura y escritura en Moodle.
    Incluye gestión de usuarios, inscripciones y creación dinámica de espacios (cursos).

    Las operaciones de lectura utilizan caché Redis para reducir llamadas a la API externa.
    Las operaciones de escritura invalidan el caché relacionado para mantener consistencia.
    """

    @staticmethod
    def _hash_identifier(value: str) -> str:
        """Genera un hash corto para no exponer PII (como emails) en las llaves de Redis."""
        return hashlib.sha256(value.strip().lower().encode()).hexdigest()[:12]

    @staticmethod
    async def get_user_profile_by_email(institute: InstitutesEnum, user_email: str):
        """
        Busca un usuario en el LMS utilizando su dirección de correo electrónico.

        Útil para la sincronización inicial de cuentas cuando el usuario ya existe
        en Moodle pero no en la base de datos local de MACTI.

        Resultado cacheado para evitar llamadas repetidas a Moodle.
        """
        email_hash = MoodleService._hash_identifier(user_email)
        cache_key = f"moodle:{institute.value}:profile_by_email:{email_hash}"

        cached = await redis_client.get(cache_key)
        if cached:
            log_info(
                logger_name=LOGGER_NAME,
                message="Perfil de usuario obtenido desde caché Redis",
                extra={"service": "Redis", "institute": institute.value},
            )
            return SimpleNamespace(user_profile=cached, error=None)

        config = MOODLE_CONFIG[institute]
        params = {
            "wstoken": config.moodle_token,
            "wsfunction": "core_user_get_users_by_field",
            "moodlewsrestformat": "json",
        }
        data = {"field": "email", "values[0]": user_email}

        result = await make_moodle_request(
            url=config.moodle_url,
            params=params,
            data=data,
            institute=institute,
        )

        if not result["success"]:
            return SimpleNamespace(
                user_profile={},
                error=result["error_message"],
            )

        user_profile = result["data"][0] if result["data"] else {}

        if user_profile:
            # TTL de 1 hora para perfiles de usuario
            await redis_client.set(cache_key, user_profile, ttl=3600)

        return SimpleNamespace(
            user_profile=user_profile,
            error=None,
        )

    @staticmethod
    async def get_user_profile(institute: InstitutesEnum, user_id: int, course_id: int):
        """
        Obtiene el perfil detallado de un usuario dentro del contexto de un curso.

        Este método es clave para recuperar los ROLES (Student, Teacher, etc.)
        que el usuario desempeña en una materia específica.

        Resultado cacheado para evitar llamadas repetidas a Moodle.
        """
        cache_key = f"moodle:{institute.value}:course_profile:{course_id}:{user_id}"

        cached = await redis_client.get(cache_key)
        if cached:
            log_info(
                logger_name=LOGGER_NAME,
                message="Perfil de curso de usuario obtenido desde caché Redis",
                extra={"service": "Redis", "institute": institute.value},
            )
            return SimpleNamespace(user_profile=cached, error=None)

        config = MOODLE_CONFIG[institute]
        params = {
            "wstoken": config.moodle_token,
            "wsfunction": "core_user_get_course_user_profiles",
            "moodlewsrestformat": "json",
        }

        data = {
            "userlist[0][courseid]": course_id,
            "userlist[0][userid]": user_id,
        }

        result = await make_moodle_request(
            url=config.moodle_url,
            params=params,
            data=data,
            institute=institute,
        )

        if not result["success"]:
            return SimpleNamespace(
                user_profile=None,
                error=result["error_message"],
            )

        user_profiles = result["data"]
        user_profile = user_profiles[0] if user_profiles else None

        if user_profile:
            await redis_client.set(cache_key, user_profile, ttl=3600)

        return SimpleNamespace(
            user_profile=user_profile,
            error=None,
        )

    @staticmethod
    async def get_user_by_email(email: str, institute: InstitutesEnum) -> int | None:
        """
        Reutiliza la función existente para obtener únicamente el ID del usuario.
        """
        res = await MoodleService.get_user_profile_by_email(institute, email)
        if res.error is None and res.user_profile:
            return res.user_profile.get("id")
        return None

    @staticmethod
    async def get_course_by_shortname(
        shortname: str, institute: InstitutesEnum
    ) -> int | None:
        """
        Busca un curso por su nombre corto y devuelve su ID en Moodle.

        Resultado cacheado para evitar llamadas repetidas a Moodle.
        """
        clean_shortname = shortname.strip().lower()
        cache_key = f"moodle:{institute.value}:course_by_shortname:{clean_shortname}"

        cached = await redis_client.get(cache_key)
        if cached is not None:
            log_info(
                logger_name=LOGGER_NAME,
                message="ID de curso obtenido desde caché Redis",
                extra={"service": "Redis", "institute": institute.value},
            )
            return cached

        config = MOODLE_CONFIG[institute]
        params = {
            "wstoken": config.moodle_token,
            "wsfunction": "core_course_get_courses_by_field",
            "moodlewsrestformat": "json",
        }
        data = {"field": "shortname", "value": shortname}

        result = await make_moodle_request(
            url=config.moodle_url,
            params=params,
            data=data,
            institute=institute,
        )

        course_id = None
        if (
            result["success"]
            and result["data"]
            and len(result["data"].get("courses", [])) > 0
        ):
            course_id = result["data"]["courses"][0]["id"]

        # Cachear incluso si es None para mitigar repetidas consultas a cursos inexistentes
        await redis_client.set(cache_key, course_id, ttl=3600)

        return course_id

    @staticmethod
    async def get_assignment_id_by_name(
        course_id: int, assignment_name: str, institute: InstitutesEnum
    ) -> int | None:
        """
        Busca el ID de una tarea específica dentro de un curso utilizando su nombre exacto.

        Resultado cacheado para evitar llamadas repetidas a Moodle.
        """
        name_hash = MoodleService._hash_identifier(assignment_name)
        cache_key = f"moodle:{institute.value}:assignment:{course_id}:{name_hash}"

        cached = await redis_client.get(cache_key)
        if cached is not None:
            return cached

        config = MOODLE_CONFIG[institute]
        params = {
            "wstoken": config.moodle_token,
            "wsfunction": "mod_assign_get_assignments",
            "moodlewsrestformat": "json",
        }
        data = {"courseids[0]": course_id}

        result = await make_moodle_request(
            url=config.moodle_url,
            params=params,
            data=data,
            institute=institute,
        )

        assignment_id = None
        if result["success"] and result["data"] and "courses" in result["data"]:
            for course in result["data"]["courses"]:
                if course["id"] == course_id:
                    for assign in course.get("assignments", []):
                        if (
                            assign["name"].strip().lower()
                            == assignment_name.strip().lower()
                        ):
                            assignment_id = assign["id"]
                            break

        await redis_client.set(cache_key, assignment_id, ttl=3600)
        return assignment_id

    @staticmethod
    async def update_grade(
        institute: InstitutesEnum,
        course_id: int,
        assignment_id: int,
        moodle_userid: int,
        grade: float,
    ) -> dict:
        """
        Actualiza o inserta la calificación de un usuario en una tarea específica.

        Invalida el caché de asignaciones del curso para mantener consistencia.
        """
        config = MOODLE_CONFIG[institute]
        params = {
            "wstoken": config.moodle_token,
            "wsfunction": "mod_assign_save_grade",
            "moodlewsrestformat": "json",
        }
        data = {
            "assignmentid": assignment_id,
            "userid": moodle_userid,
            "grade": grade,
            "attemptnumber": -1,
            "addattempt": 0,
            "workflowstate": "graded",
            "applytoall": 1,
        }

        result = await make_moodle_request(
            url=config.moodle_url,
            params=params,
            data=data,
            institute=institute,
        )

        if result["success"]:
            # Invalidación limpia por patrón jerárquico del curso
            await redis_client.delete_pattern(
                f"moodle:{institute.value}:assignment:{course_id}:*"
            )
            log_info(
                logger_name=LOGGER_NAME,
                message="Calificación actualizada en Moodle y caché invalidada",
                extra={"service": "Moodle", "institute": institute.value},
            )
            return {"success": True, "data": result.get("data")}

        return {
            "success": False,
            "error_message": result.get(
                "error_message", "Error desconocido al actualizar calificación"
            ),
        }

    @staticmethod
    async def get_admins(institute: InstitutesEnum) -> GetAdminsResult:
        """
        Función auxiliar para obtener la lista de emails de administradores de un instituto.
        """
        cache_key = f"moodle:{institute.value}:admins:list"
        cached = await redis_client.get(cache_key)
        if cached:
            return GetAdminsResult(
                success=True,
                error_message=None,
                admins=cached,
            )

        config = MOODLE_CONFIG[institute]
        endpoint = config.moodle_url

        params = {
            "wstoken": config.moodle_token,
            "wsfunction": "local_sitemanagers_get_site_managers",
            "moodlewsrestformat": "json",
        }

        result_response = await make_moodle_request(
            url=endpoint,
            params=params,
            institute=institute,
        )
        if not result_response["success"]:
            return GetAdminsResult(
                success=False,
                error_message=result_response["error_message"],
                admins=[],
            )

        admins_data = result_response.get("data", [])
        await redis_client.set(cache_key, admins_data, ttl=7200)

        return GetAdminsResult(
            success=True,
            error_message=None,
            admins=admins_data,
        )

    @staticmethod
    async def get_user_courses(institute: InstitutesEnum, moodle_userid: int):
        """
        Obtiene la lista de todos los cursos en los que un usuario está inscrito
        dentro de Moodle utilizando su ID de Moodle.

        Resultado cacheado para evitar llamadas repetidas a Moodle.
        """
        cache_key = f"moodle:{institute.value}:user_courses:{moodle_userid}"
        cached = await redis_client.get(cache_key)
        if cached:
            log_info(
                logger_name=LOGGER_NAME,
                message="Cursos inscritos del usuario obtenidos desde caché Redis",
                extra={"service": "Redis", "institute": institute.value},
            )
            return SimpleNamespace(courses=cached, error=None)

        config = MOODLE_CONFIG[institute]
        params = {
            "wstoken": config.moodle_token,
            "wsfunction": "core_enrol_get_users_courses",
            "moodlewsrestformat": "json",
        }
        data = {"userid": moodle_userid}

        result = await make_moodle_request(
            url=config.moodle_url,
            params=params,
            data=data,
            institute=institute,
        )

        if not result["success"]:
            return SimpleNamespace(
                courses=[],
                error=result["error_message"],
            )

        courses = result["data"] if isinstance(result["data"], list) else []

        # Cachear por 30 minutos (1800 seg)
        await redis_client.set(cache_key, courses, ttl=1800)

        return SimpleNamespace(
            courses=courses,
            error=None,
        )

    @staticmethod
    async def invalidate_user_courses_cache(institute: InstitutesEnum, moodle_userid: int) -> None:
        """
        Invalida manualmente la caché de cursos inscritos para un usuario específico.
        Útil tras ejecutar inscripciones (enroll_user).
        """
        cache_key = f"moodle:{institute.value}:user_courses:{moodle_userid}"
        await redis_client.delete(cache_key)

    @staticmethod
    async def get_user_roles(
        institute: InstitutesEnum,
        course_id: int,
        moodle_id: int,
    ) -> list[RoleEnum]:
        """
        Función auxiliar para recuperar roles asignados en un curso de Moodle.
        """
        get_user_profile_result = await MoodleService.get_user_profile(
            institute=institute, user_id=moodle_id, course_id=course_id
        )

        if get_user_profile_result.error:
            return []

        user_roles = get_user_profile_result.user_profile.get("roles", [])
        list_roles = [RoleEnum(role["roleid"]) for role in user_roles]

        return list_roles