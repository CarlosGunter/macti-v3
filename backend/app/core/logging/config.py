"""
Configuración centralizada de logging para MACTI API.
Utiliza loguru con sinks a archivos JSON rotativos diarios y stderr para k8s.
Los logs se almacenan en app/core/logging/logs/ dentro del proyecto.
En producción, montar un PersistentVolume en esta ruta.
"""

import sys
import json
from pathlib import Path
from app.core.environment import environment
from loguru import logger

# Ruta dentro del proyecto
log_dir = Path(environment.LOGS_DIR).resolve()
log_dir.mkdir(parents=True, exist_ok=True)
print(f"--> [DEBUG LOGS] Escribiendo logs en: {log_dir}")

# Formato stderr más simple
STDERR_FORMAT = (
    "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
    "<level>{level: <8}</level> | "
    "<cyan>{extra[logger_name]}</cyan> | "
    "<level>{message}</level>\n"
)

def json_formatter(record):
    """Formatea el record como JSON válido para archivos .jsonl"""
    log_entry = {
        "timestamp": record["time"].strftime("%Y-%m-%d %H:%M:%S.%f"),
        "level": record["level"].name,
        "logger": record["extra"].get("logger_name", "unknown"),
        "file": record["name"],
        "line": record["line"],
        "function": record["function"],
        "message": record["message"],
        "extra": record["extra"].get("payload", {})
    }
    record["extra"]["serialized"] = json.dumps(log_entry, ensure_ascii=False, default=str)
    return "{extra[serialized]}\n"


def setup_logging():
    """Configura los sinks de loguru. Se llama una vez al arrancar la app."""

    # Remover sink por defecto
    logger.remove()

    # 1. Sink a stderr (para kubectl logs / terminal)
    logger.add(
        sys.stderr,
        format=STDERR_FORMAT,
        level="DEBUG",
        colorize=True,
        backtrace=True,
        diagnose=True,
    )

    # 2. Sink de errores: un archivo por día, JSON, 30 días de retención
    logger.add(
        log_dir / "error_{time:YYYY-MM-DD}.jsonl",
        format=json_formatter,
        level="ERROR",
        rotation="00:00",
        retention="30 days",
        compression="gz",
        enqueue=True,
        backtrace=True,
        diagnose=True,
        filter=lambda record: record["level"].name == "ERROR",
    )

    # 3. Sink de aplicación: info, seguridad, auditoría
    logger.add(
        log_dir / "app_{time:YYYY-MM-DD}.jsonl",
        format=json_formatter,
        level="INFO",
        rotation="00:00",
        retention="30 days",
        compression="gz",
        enqueue=True,
        backtrace=True,
        diagnose=False,
    )

    # 4. Sink crítico separado para alertas
    logger.add(
        log_dir / "critical_{time:YYYY-MM-DD}.jsonl",
        format=json_formatter,
        level="CRITICAL",
        rotation="00:00",
        retention="90 days",
        compression="gz",
        enqueue=True,
        backtrace=True,
        diagnose=True,
    )

    # Mensaje inicial de confirmación
    logger.bind(logger_name="macti.logging", payload={}).info(
        "Logging configurado correctamente"
    )