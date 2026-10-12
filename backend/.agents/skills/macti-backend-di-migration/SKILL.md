---
name: macti-backend-di-migration
description: Guía y procedimiento paso a paso para migrar controladores estáticos a clases con constructor e inyección de dependencias (DI) mediante Depends de FastAPI. Usa este skill cuando refactorices controladores y rutas para eliminar prop drilling y acoplamiento estático.
---

# Migración a Controladores con Inyección de Dependencias (FastAPI)

Este skill define el estándar y procedimiento para migrar controladores con métodos estáticos (`@staticmethod`) a clases instanciables con **Inyección de Dependencias (DI)** mediante `Depends` de FastAPI.

---

## 🎯 Motivación y Beneficios

1. **Eliminar el *Props Drilling*:** Evita recibir dependencias (`db`, `current_user`, `institute`, etc.) en las funciones de ruta para luego tener que pasarlas manualmente a través de múltiples métodos estáticos.
2. **Encapsulamiento Limpio:** El controlador centraliza su contexto (`self.db`, `self.current_user`, `self.institute`) en su constructor `__init__`.
3. **Facilidad de Pruebas Unitarias:** Permite instanciar directamente el controlador en pruebas pasando dobles de prueba (mocks) en su constructor sin necesidad de levantar el ciclo completo de dependencias de FastAPI.
4. **Rutas Desacopladas:** La función de la ruta solo se encarga del enrutamiento y delega la ejecución al controlador inyectado.

---

## 📐 Estándar de Implementación

### 1. Estructura del Controlador (`controllers/`)

- **Constructor (`__init__`):** Declara las dependencias que FastAPI debe resolver (`Query`, `Path`, `Depends(get_db)`, `Depends(get_current_user)`, etc.) utilizando tipado fuerte con `Annotated`.
- **Métodos de Instancia:** Los métodos públicos y privados deben ser métodos de instancia normales (`def metodo(self, ...)`), consumiendo las dependencias a través de `self`.
- **Cero `@staticmethod` innecesarios:** Se remueve el uso de `@staticmethod` en la lógica de negocio y métodos de ayuda internos.
- **Manejo de Repositorios:** Si el controlador requiere un repositorio, puede recibir `db: Annotated[Session, Depends(get_db)]` en `__init__` e instanciar el repositorio como atributo (`self.repository = MiRepository(db)`).

### 2. Estructura de la Ruta (`routes.py`)

- El endpoint inyecta el controlador completo usando `Annotated[MiControlador, Depends(MiControlador)]` (o `Depends()`).
- Si el endpoint recibe un cuerpo de petición (`Body` / esquema Pydantic), se recibe en la firma de la ruta y se pasa al método del controlador: `await controller.mi_metodo(data)`.
- Si el endpoint solo depende de parámetros del request (Query, Headers, Auth, DB), la función de ruta no requiere parámetros adicionales: simplemente invoca `await controller.mi_metodo()`.

---

## 🔄 Guía Paso a Paso para la Migración

### Paso 1: Analizar el controlador y la ruta existentes
1. Identifica qué dependencias (`db`, `current_user`, `institute`, etc.) se están recibiendo en la ruta y reenviando a métodos estáticos del controlador.
2. Identifica los métodos privados auxiliares que reciben esas mismas dependencias una y otra vez.

### Paso 2: Refactorizar el Controlador
1. Añade un constructor `__init__` que reciba todas las dependencias con sus respectivos `Depends(...)`, `Query(...)`, o `Path(...)`.
2. Asigna las dependencias a atributos de instancia (`self.db`, `self.current_user`, etc.).
3. Convierte los métodos estáticos a métodos de instancia (`self`).
4. Reemplaza los argumentos repetidos por los atributos de instancia (`self.<atributo>`).
5. Convierte los métodos privados auxiliares a métodos de instancia y llámalos con `self._metodo_privado(...)`.

### Paso 3: Simplificar la Ruta (`routes.py`)
1. Elimina de la firma de la ruta las dependencias que ahora están en el `__init__` del controlador.
2. Declara el controlador con `controller: Annotated[MiControlador, Depends(MiControlador)]`.
3. Invoca la acción sobre la instancia: `return await controller.accion(...)`.

### Paso 4: Calidad y Formato
1. Asegura que todas las clases y métodos conserven sus **docstrings actualizados** explicando argumentos y retornos.
2. Ejecuta `uv run ruff check --fix` y `uv run ruff format`.
3. Verifica que la documentación Swagger (`/docs`) mantenga todos los parámetros esperados.

---

## 💡 Ejemplo Comparativo (Antes vs. Después)

### ❌ Antes (Clase estática con props drilling)

```python
# controllers/user_controller.py
class UserController:
    @staticmethod
    async def get_user_status(institute: InstitutesEnum, current_user: CurrentUser, db: Session) -> UserStatusResponse:
        repo = UserRepository(db)
        is_valid = UserController._validate_user(current_user, institute)
        data = repo.get_by_id(current_user.auth_id)
        return UserStatusResponse(status=data.status)

    @staticmethod
    def _validate_user(current_user: CurrentUser, institute: InstitutesEnum) -> bool:
        return current_user.email.endswith(f"@{institute.value}.unam.mx")

# routes.py
@router.get("/status", response_model=UserStatusResponse)
async def get_user_status(
    institute: InstitutesEnum = Query(...),
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserStatusResponse:
    return await UserController.get_user_status(institute=institute, current_user=current_user, db=db)
```

### ✅ Después (Clase con Inyección de Dependencias)

```python
# controllers/user_controller.py
from typing import Annotated
from fastapi import Depends, Query
from sqlalchemy.orm import Session

from app.core.db.database import get_db
from app.shared.dependecies.auth_current_user import CurrentUser, get_current_user
from app.shared.enums.institutes_enum import InstitutesEnum
from ..repositories.user_repository import UserRepository
from ..schemas import UserStatusResponse


class UserController:
    """Controlador para la gestión de estatus de usuario con inyección de dependencias."""

    def __init__(
        self,
        institute: Annotated[InstitutesEnum, Query(..., description="Instituto del usuario")],
        current_user: Annotated[CurrentUser, Depends(get_current_user)],
        db: Annotated[Session, Depends(get_db)],
    ):
        self.institute = institute
        self.current_user = current_user
        self.repository = UserRepository(db)

    async def get_user_status(self) -> UserStatusResponse:
        """Obtiene el estatus del usuario actual en el instituto configurado."""
        self._validate_user()
        data = self.repository.get_by_id(self.current_user.auth_id)
        return UserStatusResponse(status=data.status)

    def _validate_user(self) -> bool:
        """Valida que el correo corresponda al instituto."""
        return self.current_user.email.endswith(f"@{self.institute.value}.unam.mx")


# routes.py
from typing import Annotated
from fastapi import APIRouter, Depends
from .controllers.user_controller import UserController
from .schemas import UserStatusResponse

router = APIRouter(prefix="/users", tags=["Usuarios"])

@router.get("/status", response_model=UserStatusResponse)
async def get_user_status(
    controller: Annotated[UserController, Depends(UserController)],
) -> UserStatusResponse:
    """Retorna el estatus del usuario autenticado."""
    return await controller.get_user_status()
```
