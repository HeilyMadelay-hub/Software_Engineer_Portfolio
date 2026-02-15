# Package marker for the routers package
# Import router modules so they are available when `from .routers import health` is used.
from . import health, traducir, evaluar

__all__ = ["health", "traducir", "evaluar"]
