from fastapi import FastAPI # Importamos la biblioteca FastAPI
from .routers import health # Router health

app = FastAPI() # Inicio de la app

app.include_router(health.router)