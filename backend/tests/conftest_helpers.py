"""Helpers y fixtures reutilizables para la suite de pruebas de MACTI."""

from unittest.mock import MagicMock
from uuid import uuid4

from fastapi.testclient import TestClient

from app.core.db.database import get_db
from app.main import app
from app.shared.dependecies.auth_current_user import CurrentUser, get_current_user


def build_fake_user(
    auth_id: int = 1,
    moodle_id: int = 50,
    email: str = "usuario.test@unam.mx",
) -> CurrentUser:
    """Construye una instancia válida de CurrentUser para pruebas."""
    return CurrentUser(
        sub=uuid4(),
        email=email,
        given_name="Pedro",
        family_name="Ramírez",
        auth_id=auth_id,
        moodle_id=moodle_id,
    )


def create_test_client(
    db_mock: MagicMock | None = None,
    current_user: CurrentUser | None = None,
    extra_overrides: dict | None = None,
) -> TestClient:
    """Crea un TestClient con dependencias críticas aisladas (BD y Autenticación)."""
    session_mock = db_mock or MagicMock()
    app.dependency_overrides[get_db] = lambda: session_mock

    if current_user is not None:
        app.dependency_overrides[get_current_user] = lambda: current_user

    if extra_overrides:
        for dep, override_fn in extra_overrides.items():
            app.dependency_overrides[dep] = override_fn

    return TestClient(app)


def clear_overrides() -> None:
    """Limpia todas las sobrescrituras de dependencias de FastAPI."""
    app.dependency_overrides.clear()
