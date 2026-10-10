# Módulo ListCoursesController - Consulta de Oferta Académica
#
# Este controlador actúa como un puente de consulta directa hacia las instancias de
# Moodle. Su propósito es recuperar el catálogo completo de cursos configurados
# en un instituto específico, permitiendo que la interfaz de MACTI presente la
# oferta académica actualizada en tiempo real.

from fastapi import HTTPException

from app.core.logging.macti_logger import log_macti_error
from app.modules.courses.services.moodle_service import MoodleService
from app.shared.enums.institutes_enum import InstitutesEnum


class ListCoursesController:
    """
    Controlador encargado de gestionar la recuperación de metadatos de cursos
    alojados en plataformas externas (Moodle).
    """

    @staticmethod
    async def list_courses(
        institute: InstitutesEnum,
        ids: list[int] | None = None,
        search: str | None = None,
    ) -> list:
        """
        Lista todos los cursos disponibles en la plataforma Moodle para un instituto específico.

        Proceso:
        1. Invoca al servicio MoodleService para realizar una petición asíncrona.
        2. Valida la respuesta del Web Service de Moodle.
        3. En caso de éxito, retorna una lista de objetos de curso (id, fullname, shortname, etc.).

        Errores:
            Lanza una excepción 502 (Bad Gateway) si la comunicación con Moodle falla
            o si el token de administración no tiene permisos de lectura.
        """

        # Consumo del servicio de Moodle especializado en lectura de catálogo
        courses = await MoodleService.get_courses(institute=institute, ids=ids)

        # Cuando se recuperan todos los cursos, Moodle retorna en su primer elemento
        # la misma instancia, se elimina para evitar mostrarla en la lista.
        if ids is None and courses.courses:
            courses.courses = courses.courses[1:]

        # Manejo de errores provenientes del Web Service
        if courses.error:
            # Registro en log estructurado del fallo de negocio/servicio en el controlador
            log_macti_error(
                logger_name="list_courses_controller",
                error_code="MOODLE_COURSE_LIST_ERROR",
                message=f"Fallo al recuperar cursos de Moodle ({institute.value}): {courses.error}",
                extra={
                    "institute": institute.value,
                    "filter_ids": ids,
                },
            )

            # Si el servicio retorna un error, se propaga al cliente con un código
            # estandarizado para que el front-end pueda mostrar una alerta adecuada.
            raise HTTPException(
                status_code=502,
                detail={
                    "error_code": "MOODLE_COURSE_LIST_ERROR",
                    "message": courses.error,
                },
            )

        course_list = courses.courses or []

        # Filtrado tipo LIKE insensible a mayúsculas/minúsculas
        if search and search.strip():
            query = search.strip().lower()

            def match_course(c) -> bool:
                fn = getattr(c, "fullname", None) or (
                    c.get("fullname") if isinstance(c, dict) else ""
                )
                sn = getattr(c, "shortname", None) or (
                    c.get("shortname") if isinstance(c, dict) else ""
                )
                dn = getattr(c, "displayname", None) or (
                    c.get("displayname") if isinstance(c, dict) else ""
                )
                return (
                    query in str(fn or "").lower()
                    or query in str(sn or "").lower()
                    or query in str(dn or "").lower()
                )

            course_list = [c for c in course_list if match_course(c)]

        # Retorna el listado de cursos directamente.
        # Moodle suele retornar: id, shortname, fullname, displayname e idnumber.
        return course_list
