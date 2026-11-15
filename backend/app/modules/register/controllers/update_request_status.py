# Módulo ChangeStatusController - Gestión del Ciclo de Vida de Solicitudes
# Este controlador maneja la transición de estados de las solicitudes de cuenta.
# Orquesta la lógica de negocio sin ocuparse directamente de la persistencia.

from typing import Annotated

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db.database import get_db
from app.core.logging.macti_logger import log_macti_error
from app.modules.register.repositories.request_status_repository import (
    RequestStatusRepository,
)
from app.modules.register.schemas import RequestStatusUpdateSchema
from app.modules.register.services.email_service import EmailService
from app.modules.register.services.kc_service import KeycloakService
from app.modules.register.services.moodle_service import MoodleService
from app.modules.register.use_cases.enroll_user import EnrollUserUseCase
from app.shared.dependecies.auth_current_user import CurrentUser
from app.shared.dependecies.auth_scope_course_manager import ScopeCourseManager
from app.shared.dependecies.auth_scopes_base import AuthScopes
from app.shared.enums.institutes_enum import InstitutesEnum
from app.shared.enums.role_enum import AccountRoleEnum
from app.shared.enums.status_enum import RequestStatusEnum
from app.shared.models.student_courses_model import StudentCourseRequest
from app.shared.models.teacher_courses_model import TeacherCourseRequest


class RequestStatusController:
    """
    Controlador encargado de actualizar el estado de las solicitudes de cuenta.

    Responsabilidades:
    - Orquestar la lógica de negocio según el nuevo estado
    - Delegar operaciones de BD al repositorio
    - Coordinar llamadas a servicios externos (Keycloak, Moodle)
    - Manejar errores y transacciones
    """

    # Definición de transiciones de estado permitidas
    VALID_TRANSITIONS = {
        RequestStatusEnum.PENDING: {
            RequestStatusEnum.APPROVED,
            RequestStatusEnum.REJECTED,
        },
        RequestStatusEnum.APPROVED: {
            RequestStatusEnum.REJECTED,
            RequestStatusEnum.PENDING,
        },
        RequestStatusEnum.REJECTED: {
            RequestStatusEnum.PENDING,
            RequestStatusEnum.APPROVED,
        },
        RequestStatusEnum.ENROLLED: set(),
    }

    def __init__(self, db: Annotated[Session, Depends(get_db)]) -> None:
        """
        Inicializa el controlador inyectando la sesión de base de datos y creando su repositorio.

        Args:
            db: Sesión activa de SQLAlchemy inyectada por FastAPI.
        """
        self.db = db
        self.repository = RequestStatusRepository(db)

    async def update_request_status(
        self,
        data: RequestStatusUpdateSchema,
        role: AccountRoleEnum,
        institute: InstitutesEnum,
        current_user: CurrentUser,
    ):
        """
        Cambia el estatus de una solicitud de cuenta específica.

        Flujo:
        1. Valida que la solicitud exista y la transición sea válida
        2. Procesa la transición según el nuevo estado
        3. Persiste los cambios
        """
        # Obtener la solicitud con todas sus relaciones
        course_request = self.repository.get_course_request(data.request_id, role)
        if not course_request:
            raise HTTPException(
                status_code=404,
                detail={
                    "error_code": "SOLICITUD_NO_ENCONTRADA",
                    "message": f"No se encontró una solicitud con ID {data.request_id} para el rol {role.value}.",
                },
            )

        # Validar transición de estado
        self._validate_transition(course_request.status, data.new_status)

        await self._authorize_request_action(
            course_request=course_request,
            institute=institute,
            current_user=current_user,
        )

        # Procesar cambio de estado
        try:
            message = await self._process_status_transition(
                course_request, data.new_status, institute
            )
        except HTTPException:
            self.repository.rollback()
            raise
        except Exception as e:
            self.repository.rollback()
            raise HTTPException(
                status_code=500,
                detail={
                    "error_code": "INTERNAL_ERROR",
                    "message": f"Error interno al procesar la solicitud: {str(e)}",
                },
            ) from e

        # Persiste cambios
        self.repository.commit()

        return {"message": message}

    async def _authorize_request_action(
        self,
        course_request: StudentCourseRequest | TeacherCourseRequest,
        institute: InstitutesEnum,
        current_user: CurrentUser,
    ) -> None:
        """
        Ejecuta manualmente la dependencia correcta según el tipo de solicitud.

        - ALUMNO: valida permisos de gestión del curso usando ScopeCourseManager.
        - DOCENTE: valida permisos administrativos usando AuthScopes.
        """
        if isinstance(course_request, StudentCourseRequest):
            await ScopeCourseManager()(
                current_user=current_user,
                institute=institute,
                course_id=course_request.moodle_course_id,
            )
            return

        if isinstance(course_request, TeacherCourseRequest):
            await AuthScopes(AccountRoleEnum.ADMIN)(
                current_user=current_user,
                institute=institute,
            )
            return

    def _validate_transition(
        self, current_status: RequestStatusEnum, new_status: RequestStatusEnum
    ) -> None:
        """
        Valida que la transición de estado sea permitida.

        Args:
            current_status: Estado actual
            new_status: Estado destino

        Raises:
            HTTPException si la transición no es válida
        """
        valid_transitions = self.VALID_TRANSITIONS.get(current_status, set())
        if new_status not in valid_transitions:
            raise HTTPException(
                status_code=409,
                detail={
                    "error_code": "TRANSICION_INVALIDA",
                    "message": f"No se puede transicionar de {current_status.value} a {new_status.value}",
                },
            )

    async def _process_status_transition(
        self,
        course_request: StudentCourseRequest | TeacherCourseRequest,
        new_status: RequestStatusEnum,
        institute: InstitutesEnum,
    ) -> str:
        """
        Procesa la transición de estado según el nuevo estado requerido.

        Args:
            course_request: La solicitud de curso a procesar
            new_status: El nuevo estado
            institute: Instituto del usuario

        Returns:
            Mensaje descriptivo del resultado

        Raises:
            HTTPException si hay errores en el proceso
        """
        if new_status == RequestStatusEnum.APPROVED:
            return await self._handle_approved(course_request, institute)
        elif new_status == RequestStatusEnum.PENDING:
            return self._handle_pending(course_request)
        elif new_status == RequestStatusEnum.REJECTED:
            return await self._handle_rejected(course_request, course_request.status)
        else:
            raise HTTPException(
                status_code=422,
                detail={
                    "error_code": "ESTADO_NO_COMPATIBLE",
                    "message": f"El estado {new_status.value} no puede ser procesado aquí.",
                },
            )

    async def _handle_approved(
        self,
        course_request: StudentCourseRequest | TeacherCourseRequest,
        institute: InstitutesEnum,
    ) -> str:
        """
        Procesa aprobación de solicitud.

        Si la cuenta NO está activa:
        - Genera un token de verificación
        - Cambia estado a APPROVED

        Si la cuenta SÍ está activa:
        - Inscribe al usuario en el curso
        - Cambia estado a ENROLLED

        Args:
            course_request: La solicitud a aprobar
            institute: Instituto del usuario

        Returns:
            Mensaje descriptivo

        Raises:
            HTTPException si hay errores en la inscripción
        """
        if not course_request.auth.is_active:
            return self._handle_approved_inactive(course_request)
        else:
            return await self._handle_approved_active(course_request, institute)

    def _handle_approved_inactive(
        self,
        course_request: StudentCourseRequest | TeacherCourseRequest,
    ) -> str:
        """
        Genera token de verificación para cuentas inactivas.

        Pasos:
        1. Crea/actualiza token de verificación
        2. Envía correo de validación con el token
        3. Cambia estado a APPROVED

        Args:
            course_request: La solicitud

        Returns:
            Mensaje de éxito

        Raises:
            HTTPException si hay error al enviar el correo
        """
        # Generar token de verificación
        token_record = self.repository.create_or_update_verification_token(
            course_request.auth.id
        )
        token_value = getattr(token_record, "token", token_record)

        # Enviar correo de validación con el token
        email_result = EmailService.send_validation_email(
            to_email=course_request.auth.email,
            token=token_value,
        )
        if not email_result.success:
            log_macti_error(
                logger_name="request_status_controller",
                error_code="EMAIL_VALIDATION_FAILED",
                message=f"Fallo al enviar correo de validación a {course_request.auth.email}",
                extra={
                    "auth_id": course_request.auth.id,
                    "email": course_request.auth.email,
                    "reason": email_result.error,
                },
            )
            raise HTTPException(
                status_code=502,
                detail={
                    "error_code": "EMAIL_ERROR",
                    "message": f"Error al enviar el correo de validación: {email_result.error}",
                },
            )
        # Cambiar estado a APPROVED
        self.repository.update_request_status(
            course_request, RequestStatusEnum.APPROVED
        )
        return "Solicitud aprobada. Se ha enviado un correo de validación al usuario para confirmar su cuenta."

    async def _handle_approved_active(
        self,
        course_request: StudentCourseRequest | TeacherCourseRequest,
        institute: InstitutesEnum,
    ) -> str:
        """
        Inscribe usuario en el curso para cuentas activas.

        Args:
            course_request: La solicitud
            institute: Instituto del usuario

        Returns:
            Mensaje de éxito

        Raises:
            HTTPException si hay errores en la inscripción
        """
        enroll_user_use_case = EnrollUserUseCase(
            moodle_service=MoodleService(), institute=institute, db=self.db
        )
        enroll_result = await enroll_user_use_case.execute(
            request_course_data=course_request
        )

        if not enroll_result.enrolled:
            raise HTTPException(
                status_code=502,
                detail={
                    "error_code": "INSCRIPCION_ERROR",
                    "message": f"Error al inscribir al usuario en el curso: {enroll_result.error}",
                },
            )

        self.repository.update_request_status(
            course_request, RequestStatusEnum.ENROLLED
        )
        return "Usuario inscrito exitosamente en el curso."

    def _handle_pending(
        self,
        course_request: StudentCourseRequest | TeacherCourseRequest,
    ) -> str:
        """
        Revierte el estado a pendiente.

        Args:
            course_request: La solicitud

        Returns:
            Mensaje de éxito
        """
        self.repository.update_request_status(course_request, RequestStatusEnum.PENDING)
        return "Solicitud revertida a estado pendiente."

    async def _handle_rejected(
        self,
        course_request: StudentCourseRequest | TeacherCourseRequest,
        current_status: RequestStatusEnum,
    ) -> str:
        """
        Procesa rechazo de solicitud.

        Limpia tokens de verificación y, si estaba en estado ENROLLED,
        elimina el usuario de Keycloak y Moodle.

        Args:
            course_request: La solicitud
            current_status: Estado actual antes del rechazo

        Returns:
            Mensaje de éxito

        Raises:
            HTTPException si hay errores al eliminar usuarios de sistemas externos
        """
        # Eliminar tokens de verificación
        self.repository.delete_verification_tokens(course_request.auth.id)

        # Si estaba ENROLLED, eliminar de Keycloak y Moodle
        if current_status == RequestStatusEnum.ENROLLED:
            await self._delete_user_from_external_systems(course_request)
            self._clear_external_ids(course_request)

        self.repository.update_request_status(
            course_request, RequestStatusEnum.REJECTED
        )
        return "Solicitud rechazada exitosamente."

    async def _delete_user_from_external_systems(
        self,
        course_request: StudentCourseRequest | TeacherCourseRequest,
    ) -> None:
        """
        Elimina el usuario de Keycloak y Moodle si existen sus IDs.

        Args:
            course_request: La solicitud con información del usuario

        Raises:
            HTTPException si hay errores al eliminar
        """
        kc_id = course_request.auth.jids.kc_id if course_request.auth.jids else None
        if kc_id:
            await KeycloakService.delete_user(
                user_id=kc_id,
                institute=course_request.institute,
            )

        moodle_id = (
            course_request.auth.jids.moodle_id if course_request.auth.jids else None
        )
        if moodle_id:
            await MoodleService.delete_user(
                user_id=moodle_id,
                institute=course_request.institute,
            )

    def _clear_external_ids(
        self,
        course_request: StudentCourseRequest | TeacherCourseRequest,
    ) -> None:
        """
        Limpia los IDs externos del usuario en la solicitud.

        Args:
            course_request: La solicitud a limpiar
        """
        pass
