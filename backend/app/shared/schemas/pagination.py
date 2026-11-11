# app/shared/schemas/pagination.py
"""
Módulo de Paginación Compartida - Proyecto MACTI

Define el esquema genérico para estandarizar las respuestas paginadas
en los endpoints que manejan catálogos o listados extensos.
"""

import math
from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):  # noqa: UP046
    """
    Estructura genérica de respuesta paginada.

    Atributos:
        items: Lista de elementos correspondientes a la página solicitada.
        total: Conteo total de elementos que coinciden con los criterios de búsqueda.
        page: Número de la página actual (1-indexada).
        limit: Cantidad de elementos devueltos por página.
        total_pages: Cantidad total de páginas calculadas.
    """

    items: list[T]
    total: int = Field(..., description="Total de registros encontrados")
    page: int = Field(..., description="Página actual (1-indexada)")
    limit: int = Field(..., description="Elementos por página")
    total_pages: int = Field(..., description="Total de páginas disponibles")

    @classmethod
    def create(cls, items: list[T], total: int, page: int, limit: int):
        """
        Método de fábrica para instanciar la respuesta calculando automáticamente total_pages.
        """
        total_pages = math.ceil(total / limit) if limit > 0 else 1
        return cls(
            items=items,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
        )
