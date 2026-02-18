# -*- coding: utf-8 -*-
from fastapi import FastAPI # Importamos la biblioteca FastAPI
from .routers import health, traducir, evaluar # Routers

app = FastAPI(title="Traductor del Amor - MVP") # Inicio de la app

app.include_router(health.router)

# Registrar routers
app.include_router(traducir.router, prefix="", tags=["Traduccion"])
# Añade el router 'traducir' a la app principal.
# 'prefix=""' indica que no se añade un prefijo global, se mantiene la ruta tal cual (/traducir).
# 'tags=["Traducción"]' se usa para agrupar los endpoints en la documentación automática.

app.include_router(evaluar.router, prefix="", tags=["Evaluacion"])
# Añade el router 'evaluar' a la app principal.
# 'prefix=""' indica que no se añade un prefijo global, se mantiene la ruta tal cual (/evaluar_respuesta).
# 'tags=["Evaluación"]' agrupa estos endpoints bajo la sección "Evaluación" en la documentación.