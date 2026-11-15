# Módulo RequestAccountController - Captura y Validación de Solicitudes
#
# Este controlador es la puerta de entrada para los nuevos usuarios en el sistema.
# Maneja la lógica inicial de registro para Alumnos y Docentes, validando duplicados
# y generando códigos de identificación interna (Subjects) para personal académico.

from typing import Annotated

from fastapi import Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.db.database import get_db
from app.core.logging.macti_logger import log_db_error, log_info, log_macti_error
from app.modules.register.repositories.request_account_repository import (
    RequestAccountRepository,
)
from app.modules.register.services.kc_service import KeycloakService
from app.shared.enums.role_enum import AccountRoleEnum

from ..schemas import StudentRequestSchema, TeacherRequestSchema

LOGGER_NAME = "account_requests_controller"


class AccountRequestsController:
    """
    Controlador encargado de procesar las peticiones iniciales de registro de cuenta.
    Incluye lógica de validación de correo único por instituto y generación de logs.
    """

    def __init__(self, db: Annotated[Session, Depends(get_db)]) -> None:
        """
        Inicializa el controlador inyectando la sesión de base de datos y su repositorio.

        Args:
            db: Sesión activa de SQLAlchemy inyectada por FastAPI.
        """
        self.db = db
        self.repository = RequestAccountRepository(db)

    async def request_account(
        self,
        role: AccountRoleEnum,
        data: StudentRequestSchema | TeacherRequestSchema,
    ) -> dict[str, str]:
        """
        Punto de entrada principal para registrar una solicitud de cuenta.

        Args:
            role: ALUMNO o DOCENTE
            data: Datos de la solicitud (varía según el rol)

        Returns:
            dict: Mensaje de éxito
        """
        try:
            self._validate_no_duplicate_request(data)
            await self._validate_no_existing_keycloak_user(data)
            self._create_request(role, data)
            return {"message": "Solicitud de cuenta registrada correctamente."}
        except HTTPException:
            self.repository.rollback()
            raise  # La excepción ya está manejada
        except SQLAlchemyError as exc:
            self.repository.rollback()
            log_db_error(
                logger_name=LOGGER_NAME,
                operation="request_account_commit",
                error_message=str(exc),
                extra={"institute": data.institute.value, "role": role.value},
            )
            raise HTTPException(
                status_code=500,
                detail={
                    "error_code": "DB_ERROR",
                    "message": f"Ocurrió un error al guardar la solicitud de cuenta: {str(exc)}",
                },
            ) from exc
        except Exception as exc:
            self.repository.rollback()
            log_macti_error(
                logger_name=LOGGER_NAME,
                error_code="ERROR_INTERNO",
                message=str(exc),
                extra={"institute": data.institute.value, "role": role.value},
            )
            raise HTTPException(
                status_code=500,
                detail={
                    "error_code": "ERROR_INTERNO",
                    "message": f"Ocurrió un error inesperado al procesar la solicitud: {str(exc)}",
                },
            ) from exc

    def _validate_no_duplicate_request(
        self,
        data: StudentRequestSchema | TeacherRequestSchema,
    ) -> None:
        existing_request = self.repository.get_by_email_and_institute(
            data.email, data.institute
        )

        if existing_request is not None:
            log_macti_error(
                logger_name=LOGGER_NAME,
                error_code="DUPLICADO",
                message="Ya existe una solicitud para este correo e instituto",
                extra={
                    "institute": data.institute.value,
                    "reason": "Solicitud duplicada en base de datos local",
                },
            )
            raise HTTPException(
                status_code=400,
                detail={
                    "error_code": "DUPLICADO",
                    "message": "Ya existe una solicitud para este correo e instituto",
                },
            )

    async def _validate_no_existing_keycloak_user(
        self,
        data: StudentRequestSchema | TeacherRequestSchema,
    ) -> None:
        verify_existence = await KeycloakService.user_exists(data.email, data.institute)
        if verify_existence.exists:
            log_macti_error(
                logger_name=LOGGER_NAME,
                error_code="EXISTE_KEYCLOAK",
                message="Usuario ya registrado previamente en Keycloak",
                extra={
                    "institute": data.institute.value,
                    "reason": "Cuenta activa existente en Keycloak",
                },
            )
            raise HTTPException(
                status_code=400,
                detail={
                    "error_code": "EXISTE_KEYCLOAK",
                    "message": "Ya tienes una cuenta activa. Inicia sesión para solicitar acceso a cursos.",
                },
            )

    def _create_request(
        self,
        role: AccountRoleEnum,
        data: StudentRequestSchema | TeacherRequestSchema,
    ) -> None:
        db_request = self.repository.create_account_request(role=role, data=data)
        self.repository.commit()
        self.repository.refresh(db_request)

        # Registro del evento exitoso en BD local sin exponer IDs ni correos
        log_info(
            logger_name=LOGGER_NAME,
            message="Solicitud de cuenta persistida exitosamente en base de datos local",
            extra={
                "institute": data.institute.value,
                "role": role.value,
                "database": "local",
            },
        )
