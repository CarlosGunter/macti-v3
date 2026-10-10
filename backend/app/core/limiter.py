# app/core/limiter.py
# Módulo de Rate Limiting - Proyecto MACTI
# Configura el limitador de peticiones (SlowAPI) respaldado por Redis con fallback en memoria.

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.environment import environment

# Construcción de la URI de conexión a Redis para el almacenamiento de cuotas
redis_auth = f":{environment.REDIS_PASSWORD}@" if environment.REDIS_PASSWORD else ""
redis_storage_uri = f"redis://{redis_auth}{environment.REDIS_HOST}:{environment.REDIS_PORT}/{environment.REDIS_DB}"

# Si REDIS_HOST no está definido o apunta a vacío, usa memoria directamente
storage_uri = (
    redis_storage_uri if getattr(environment, "REDIS_HOST", None) else "memory://"
)

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=storage_uri,
    default_limits=["120/minute"],
    swallow_errors=True,  # Evita que caídas de Redis lancen ConnectionError y terminen en HTTP 500
    in_memory_fallback_enabled=True,  # Si Redis no responde, degrada temporalmente a memoria local
    in_memory_fallback=["120/minute"],  # Cuota aplicada durante el modo fallback
)
