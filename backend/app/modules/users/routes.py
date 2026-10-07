"""Rutas del módulo de usuarios."""

from typing import Annotated

from fastapi import APIRouter, Depends

from app.modules.users.controllers.check_admin import CheckAdminController
from app.modules.users.schemas import IsAdminResponse

router = APIRouter(prefix="/users", tags=["Usuarios"])


@router.get(
    "/is-admin",
    summary="Verificar si el usuario autenticado es administrador",
    response_model=IsAdminResponse,
)
async def check_is_admin(
    controller: Annotated[CheckAdminController, Depends(CheckAdminController)],
) -> IsAdminResponse:
    """
    Endpoint que verifica si el usuario autenticado tiene permisos de administrador.

    Inicializa `CheckAdminController` mediante inyección de dependencias con `Depends`,
    resolviendo de forma automática el usuario autenticado y el instituto asociado.
    """
    return await controller.check_is_admin()
