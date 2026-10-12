"""Esquemas Pydantic para el módulo de usuarios."""

from pydantic import BaseModel, Field


class IsAdminResponse(BaseModel):
    """Esquema de respuesta para la verificación de rol de administrador."""

    is_admin: bool = Field(
        ...,
        description="Indica si el usuario autenticado tiene permisos de administrador en el instituto",
    )
