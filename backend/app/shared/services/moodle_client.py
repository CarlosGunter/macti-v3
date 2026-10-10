# Módulo MoodleClient - Cliente HTTP Asíncrono Especializado
#
# Este módulo proporciona una capa de abstracción sobre httpx para interactuar
# con la API de Moodle. Su principal ventaja es el manejo robusto de excepciones
# específicas del protocolo de Web Services de Moodle, transformando respuestas
# inconsistentes en un formato de resultado estandarizado (success/data/error).

import httpx

from app.core.logging.macti_logger import log_service_error
from app.shared.enums.institutes_enum import InstitutesEnum

# Configuración de timeout por defecto para peticiones hacia Moodle:
# 10.0s límite global y 3.0s para establecer conexión inicial.
DEFAULT_MOODLE_TIMEOUT = httpx.Timeout(10.0, connect=3.0)


async def make_moodle_request(
    url: str,
    method: str = "POST",
    params: dict | None = None,
    data: dict | None = None,
    json: dict | None = None,
    institute: InstitutesEnum | None = None,
    timeout: float | httpx.Timeout = DEFAULT_MOODLE_TIMEOUT,
    *,
    check_moodle_errors: bool = True,
) -> dict:
    """
    Realiza una petición HTTP a Moodle con gestión de errores centralizada.

    Lógica de validación:
    1. Ejecuta la petición asíncrona mediante httpx aplicando timeout explícito.
    2. Valida errores de protocolo HTTP (4xx, 5xx).
    3. Analiza el cuerpo JSON en busca de la clave 'exception', la cual Moodle
        usa para reportar errores lógicos incluso en respuestas exitosas (200 OK).

    Returns:
        Dict: Contiene 'success' (bool), 'data' (respuesta útil) y 'error_message'.
    """
    ws_function = (params or {}).get("wsfunction", "unknown_function")
    institute_val = institute.value if institute else "unknown"
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.request(
                method=method, url=url, params=params, data=data, json=json
            )
            response.raise_for_status()
            response_data = response.json()

        # Validación de 'Lógica Moodle': Detecta fallos internos del LMS
        if (
            check_moodle_errors
            and isinstance(response_data, dict)
            and "exception" in response_data
        ):
            # Agregamos log de error para seguimiento
            error_msg = f"Excepción Moodle [{response_data.get('errorcode')}]: {response_data.get('message')}"
            log_service_error(
                logger_name="moodle_client",
                service="Moodle",
                endpoint=ws_function,
                error_message=error_msg,
                extra={
                    "institute": institute_val,
                    "error_code": response_data.get("errorcode"),
                    "exception": response_data.get("exception"),
                },
            )
            return {
                "success": False,
                "data": None,
                "error_message": f"Error en la API de Moodle: {response_data.get('message', 'Error desconocido')}",
            }

        return {"success": True, "data": response_data, "error_message": None}

    except httpx.HTTPStatusError as e:
        error_msg = f"HTTP {e.response.status_code} desde Moodle"
        log_service_error(
            logger_name="moodle_client",
            service="Moodle",
            endpoint=ws_function,
            error_message=error_msg,
            status_code=e.response.status_code,
            extra={"institute": institute_val},
        )
        return {"success": False, "data": None, "error_message": error_msg}

    except httpx.TimeoutException:
        institute_str = f" ({institute.value})" if institute else ""
        error_msg = f"Timeout conectando a Moodle{institute_str}"
        log_service_error(
            logger_name="moodle_client",
            service="Moodle",
            endpoint=ws_function,
            error_message=error_msg,
            status_code=None,
            extra={"institute": institute_val, "reason": "Timeout"},
        )
        return {
            "success": False,
            "data": None,
            "error_message": error_msg,
        }
    except httpx.RequestError as e:
        institute_str = f" ({institute.value})" if institute else ""
        error_msg = f"Error de conexión con Moodle{institute_str}: {str(e)}"
        log_service_error(
            logger_name="moodle_client",
            service="Moodle",
            endpoint=ws_function,
            error_message=error_msg,
            status_code=None,
            extra={"institute": institute_val, "reason": "RequestError"},
        )
        return {
            "success": False,
            "data": None,
            "error_message": error_msg,
        }
    except Exception as e:
        error_msg = f"Fallo de conexión o timeout con Moodle: {str(e)}"
        log_service_error(
            logger_name="moodle_client",
            service="Moodle",
            endpoint=ws_function,
            error_message=error_msg,
            extra={"institute": institute_val, "error_type": type(e).__name__},
        )
        return {"success": False, "data": None, "error_message": error_msg}
