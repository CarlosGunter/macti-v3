# app/core/limiter.py
# Módulo de Rate Limiting - Proyecto MACTI
# Configura el limitador de peticiones (SlowAPI) respaldado por Redis para
# mitigar ataques de denegación de servicio, abuso de recursos y spam.

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.environment import environment

# Construcción de la URI de conexión a Redis para el almacenamiento de cuotas
redis_auth = f":{environment.REDIS_PASSWORD}@" if environment.REDIS_PASSWORD else ""
redis_storage_uri = f"redis://{redis_auth}{environment.REDIS_HOST}:{environment.REDIS_PORT}/{environment.REDIS_DB}"

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=redis_storage_uri,
    default_limits=["120/minute"],
)
