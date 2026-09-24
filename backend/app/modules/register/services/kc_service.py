# Módulo KeycloakService - Gestión de Identidades y Acceso (IAM)
# Este servicio encapsula toda la interacción con la API de Administración de Keycloak.
# Soporta una arquitectura multi-instituto, permitiendo gestionar usuarios en
# diferentes Realms de forma dinámica. Se encarga de la autenticación administrativa,
# creación, eliminación y actualización de credenciales de los usuarios.


from dataclasses import dataclass
from typing import Any
from uuid import UUID

import httpx

from app.core.logging.macti_logger import log_info, log_service_error
from app.shared.config.kc_configs import keycloak_configs
from app.shared.enums.institutes_enum import InstitutesEnum

LOGGER_NAME = "keycloak_service"


@dataclass
class CreateUserResult:
    created: bool
    user_id: UUID | None = None
    error: str | None = None


@dataclass
class GetUserResult:
    found: bool
    user: dict[str, Any] | None = None
    error: str | None = None


@dataclass
class DeleteUserResult:
    deleted: bool
    user_id: UUID | None = None
    error: str | None = None


@dataclass
class UpdatePasswordResult:
    success: bool
    error: str | None = None


@dataclass
class UserExistsResult:
    exists: bool


class KeycloakService:
    """
    Servicio centralizado para la administración de usuarios en Keycloak.

    Implementa el flujo de 'Client Credentials' para obtener tokens administrativos
    y realizar operaciones CRUD sobre los usuarios de cada instituto.
    """

    @classmethod
    async def _get_admin_token(cls, institute: InstitutesEnum) -> str:
        """
        Obtiene un Token de Acceso (JWT) administrativo para un instituto específico.

        Utiliza el 'Client ID' y 'Client Secret' configurados para autenticarse
        contra el endpoint de OpenID Connect del Realm correspondiente.
        """
        try:
            config = keycloak_configs[institute]
            token_url = (
                f"{config.url}/realms/{config.realm}/protocol/openid-connect/token"
            )
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    token_url,
                    data={
                        "client_id": config.client_id,
                        "client_secret": config.secret_pass,
                        "grant_type": "client_credentials",
                    },
                )
                response.raise_for_status()
                return response.json()["access_token"]
        except Exception as e:
            error_message = f"Fallo al autenticar con Keycloak ({institute.value}): {e}"
            log_service_error(
                logger_name=LOGGER_NAME,
                service="Keycloak",
                endpoint="protocol/openid-connect/token",
                error_message=str(e),
                extra={
                    "institute": institute.value,
                    "reason": "Fallo al obtener token administrativo",
                },
            )
            # Mantenemos la propagación del error original
            raise Exception(error_message) from e

    @classmethod
    async def create_user(
        cls, user_data: dict, institute: InstitutesEnum
    ) -> CreateUserResult:
        """
        Registra un nuevo usuario en el Realm de Keycloak del instituto indicado.

        Este método:
        1. Obtiene un token de administrador.
        2. Envía el payload con datos básicos y credenciales iniciales.
        3. Valida la creación y recupera el ID único (UUID) generado por Keycloak.
        """
        try:
            config = keycloak_configs[institute]
            token = await cls._get_admin_token(institute)
            users_api_url = f"{config.url}/admin/realms/{config.realm}/users"

            payload = {
                "username": user_data["email"],
                "email": user_data["email"],
                "firstName": user_data["name"],
                "lastName": user_data["last_name"],
                "enabled": True,
                "credentials": [
                    {
                        "type": "password",
                        "value": user_data["password"],
                        "temporary": False,  # La contraseña es definitiva desde el inicio
                    }
                ],
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    users_api_url,
                    json=payload,
                    headers={"Authorization": f"Bearer {token}"},
                )

                # Keycloak responde 201 (Created) si el usuario es nuevo
                if response.status_code in [201, 204]:
                    created_user = await cls.get_user_by_email(
                        user_data["email"], institute
                    )
                    user_id = None
                    if created_user.found and created_user.user:
                        raw_user_id = created_user.user.get("id")
                        user_id = UUID(raw_user_id) if raw_user_id else None

                    log_info(
                        logger_name=LOGGER_NAME,
                        message="Usuario registrado exitosamente en Keycloak",
                        extra={"service": "Keycloak", "institute": institute.value},
                    )
                    return CreateUserResult(created=True, user_id=user_id)
                else:
                    log_service_error(
                        logger_name=LOGGER_NAME,
                        service="Keycloak",
                        endpoint="POST /admin/realms/{realm}/users",
                        error_message=response.text,
                        status_code=response.status_code,
                        extra={
                            "institute": institute.value,
                            "reason": "Respuesta no exitosa al crear usuario",
                        },
                    )
                    return CreateUserResult(created=False, error=response.text)
        except Exception as e:
            log_service_error(
                logger_name=LOGGER_NAME,
                service="Keycloak",
                endpoint="POST /admin/realms/{realm}/users",
                error_message=str(e),
                extra={
                    "institute": institute.value,
                    "reason": "Excepción al intentar crear usuario",
                },
            )
            return CreateUserResult(created=False, error=str(e))

    @classmethod
    async def get_user_by_email(
        cls, email: str, institute: InstitutesEnum
    ) -> GetUserResult:
        """
        Busca la información detallada de un usuario mediante su correo electrónico.
        Útil para recuperar el ID interno de Keycloak tras una creación exitosa.
        """
        try:
            config = keycloak_configs[institute]
            token = await cls._get_admin_token(institute)
            users_api_url = f"{config.url}/admin/realms/{config.realm}/users"
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    users_api_url,
                    params={"email": email},
                    headers={"Authorization": f"Bearer {token}"},
                )
                users = response.json()
                if users:
                    return GetUserResult(found=True, user=users[0])
                return GetUserResult(found=False, user=None)
        except Exception as e:
            log_service_error(
                logger_name=LOGGER_NAME,
                service="Keycloak",
                endpoint="GET /admin/realms/{realm}/users",
                error_message=str(e),
                extra={
                    "institute": institute.value,
                    "reason": "Excepción al consultar usuario por email",
                },
            )
            return GetUserResult(found=False, user=None, error=str(e))

    @classmethod
    async def delete_user(
        cls, user_id: UUID, institute: InstitutesEnum
    ) -> DeleteUserResult:
        """
        Elimina de forma permanente un usuario en Keycloak.
        Utilizado principalmente en flujos de 'Rollback' cuando otros servicios (como Moodle)
        fallan durante el aprovisionamiento de la cuenta.
        """
        try:
            config = keycloak_configs[institute]
            token = await cls._get_admin_token(institute)
            users_api_url = f"{config.url}/admin/realms/{config.realm}/users"

            async with httpx.AsyncClient() as client:
                url = f"{users_api_url}/{user_id}"
                response = await client.delete(
                    url, headers={"Authorization": f"Bearer {token}"}
                )
                if response.status_code in [200, 204]:
                    log_info(
                        logger_name=LOGGER_NAME,
                        message="Usuario eliminado exitosamente en Keycloak",
                        extra={"service": "Keycloak", "institute": institute.value},
                    )
                    return DeleteUserResult(deleted=True, user_id=user_id)

                log_service_error(
                    logger_name=LOGGER_NAME,
                    service="Keycloak",
                    endpoint="DELETE /admin/realms/{realm}/users/{id}",
                    error_message=response.text,
                    status_code=response.status_code,
                    extra={
                        "institute": institute.value,
                        "reason": "Respuesta fallida al eliminar usuario",
                    },
                )
                return DeleteUserResult(
                    deleted=False, user_id=user_id, error=response.text
                )
        except Exception as e:
            log_service_error(
                logger_name=LOGGER_NAME,
                service="Keycloak",
                endpoint="DELETE /admin/realms/{realm}/users/{id}",
                error_message=str(e),
                extra={
                    "institute": institute.value,
                    "reason": "Excepción al eliminar usuario",
                },
            )
            return DeleteUserResult(deleted=False, user_id=user_id, error=str(e))

    @classmethod
    async def update_user_password(
        cls, user_id: UUID, new_password: str, institute: InstitutesEnum
    ) -> UpdatePasswordResult:
        """
        Realiza un 'Reset Password' administrativo para un usuario.
        Permite establecer una nueva contraseña sin necesidad de conocer la anterior.
        """
        try:
            config = keycloak_configs[institute]
            token = await cls._get_admin_token(institute)

            url = f"{config.url}/admin/realms/{config.realm}/users/{user_id}/reset-password"
            payload = {"type": "password", "value": new_password, "temporary": False}

            async with httpx.AsyncClient() as client:
                response = await client.put(
                    url, json=payload, headers={"Authorization": f"Bearer {token}"}
                )

                if response.status_code == 204:
                    log_info(
                        logger_name=LOGGER_NAME,
                        message="Contraseña actualizada exitosamente en Keycloak",
                        extra={"service": "Keycloak", "institute": institute.value},
                    )
                    return UpdatePasswordResult(success=True)
                else:
                    log_service_error(
                        logger_name=LOGGER_NAME,
                        service="Keycloak",
                        endpoint="PUT /reset-password",
                        error_message=response.text,
                        status_code=response.status_code,
                        extra={
                            "institute": institute.value,
                            "reason": "Fallo al resetear contraseña",
                        },
                    )
                    return UpdatePasswordResult(success=False, error=response.text)

        except Exception as e:
            log_service_error(
                logger_name=LOGGER_NAME,
                service="Keycloak",
                endpoint="PUT /reset-password",
                error_message=str(e),
                extra={
                    "institute": institute.value,
                    "reason": "Excepción al resetear contraseña",
                },
            )
            return UpdatePasswordResult(success=False, error=str(e))

    @classmethod
    async def user_exists(
        cls, email: str, institute: InstitutesEnum
    ) -> UserExistsResult:
        """
        Verifica la existencia de un usuario en Keycloak por su correo electrónico.
        Útil para validar duplicados antes de intentar crear una cuenta.
        """
        config = keycloak_configs[institute]
        token = await cls._get_admin_token(institute)

        user_api_url = (
            f"{config.url}/admin/realms/{config.realm}/users?email={email}&exact=true"
        )

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    user_api_url,
                    headers={"Authorization": f"Bearer {token}"},
                )
                users = response.json()
                return UserExistsResult(exists=len(users) > 0)
        except Exception as e:
            log_service_error(
                logger_name=LOGGER_NAME,
                service="Keycloak",
                endpoint="GET /users?email={email}",
                error_message=str(e),
                extra={
                    "institute": institute.value,
                    "reason": "Fallo al verificar existencia en Keycloak",
                },
            )
            return UserExistsResult(exists=False)
