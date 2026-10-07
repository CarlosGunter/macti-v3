"""Controlador para verificar el rol de administrador de un usuario."""

from typing import Annotated

from fastapi import Depends, Query

from app.modules.users.schemas import IsAdminResponse
from app.shared.dependecies.auth_current_user import CurrentUser, get_current_user
from app.shared.enums.institutes_enum import InstitutesEnum
from app.shared.services.moodle_service import MoodleService


class CheckAdminController:
    """Controlador que orquesta la verificación del rol de administrador."""

    def __init__(
        self,
        institute: Annotated[
            InstitutesEnum,
            Query(..., description="Instituto al que pertenece el usuario"),
        ],
        current_user: Annotated[CurrentUser, Depends(get_current_user)],
    ):
        """
        Inicializa el controlador inyectando las dependencias necesarias.

        Args:
            institute: Instituto educativo a consultar en Moodle.
            current_user: Usuario autenticado obtenido de la dependencia auth_current_user.
        """
        self.institute = institute
        self.current_user = current_user

    async def check_is_admin(self) -> IsAdminResponse:
        """
        Determina si el usuario autenticado tiene permisos de administrador en el instituto.

        Consulta la lista de administradores en Moodle mediante MoodleService.get_admins()
        y valida si el correo del usuario actual está presente en dicha lista.

        Returns:
            IsAdminResponse: Objeto Pydantic con la bandera booleana `is_admin`.
        """
        admin_result = await MoodleService.get_admins(institute=self.institute)
        admin_list = admin_result.admins if admin_result.success else []

        user_email = self.current_user.email.strip().lower()
        is_admin = any(
            self._extract_admin_email(admin).strip().lower() == user_email
            for admin in admin_list
        )

        return IsAdminResponse(is_admin=is_admin)

    def _extract_admin_email(self, admin: dict | str) -> str:
        """
        Extrae la dirección de correo electrónico del registro de un administrador.

        Args:
            admin: Datos del administrador (diccionario o cadena de texto).

        Returns:
            str: Dirección de correo electrónico del administrador.
        """
        if isinstance(admin, dict):
            return admin.get("email", "")
        return str(admin)
