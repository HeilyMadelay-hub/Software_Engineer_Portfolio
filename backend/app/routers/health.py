from fastapi import APIRouter         # Importamos APIRouter para crear un router modular
from datetime import datetime         # Para manejar tiempos de inicio y uptime
import psutil                          # Para obtener métricas de sistema (CPU, memoria)

# from app.services.cache_manager import cache_manager
# from app.middleware.rate_limiter import global_limiter

# Creamos el router que luego se incluirá en main.py
router = APIRouter()

# Guardamos la hora de inicio del servidor para calcular uptime
server_start_time = datetime.now()

# Creamos un "manejador de cache" de prueba dentro de la misma clase
class CacheManagerStub:
    def get_stats(self):
        # Retornamos stats de cache simuladas
        return {"hits": 0, "misses": 0, "size": 0}

# Creamos un "rate limiter" de prueba dentro de la misma clase
class RateLimiterStub:
    def get_stats(self):
        # Retornamos stats de rate limiting simuladas
        return {"requests": 0, "limit": 1000, "violations": 0}

# Instanciamos los stubs
cache_manager = CacheManagerStub()
global_limiter = RateLimiterStub()

@router.get("/health")                  # Definimos el endpoint GET /health
async def health_check():
    """
    Endpoint de health check mejorado.
    Retorna estado del servidor y métricas clave.
    cache_manager y  global_limiter aun no implementado
    """
    # Calculamos el tiempo que ha estado corriendo el servidor
    uptime = datetime.now() - server_start_time
    uptime_seconds = uptime.total_seconds()  # Convertimos a segundos

    # Determinamos estado: "warming_up" si el servidor lleva <2 min activo
    status = "warming_up" if uptime_seconds < 120 else "awake"

    # Obtenemos estadísticas de uso de memoria del sistema
    memory_info = psutil.virtual_memory()

    # Obtenemos estadísticas del cache LRU
    cache_stats = cache_manager.get_stats()

    # Obtenemos estadísticas del rate limiter global
    rate_stats = global_limiter.get_stats()

    # Construimos y retornamos la respuesta con toda la info
    return {
        "status": status,                  # Estado general del servidor
        "uptime_seconds": round(uptime_seconds, 2),  # Uptime en segundos
        "metrics": {
            "cache": cache_stats,          # Stats de cache: hits, misses, tamaño
            "rate_limiting": rate_stats,   # Stats de rate limiting: requests, límite, violaciones
            "memory": {
                "used_percent": memory_info.percent,  # % memoria usada
                "available_mb": round(memory_info.available / (1024*1024), 2)  # Memoria libre en MB
            }
        }
    }
