# Se centra en validar y puntuar la respuesta propuesta por el usuario.

# Incluye validación de input, cache y scoring final.

# No necesita todo el pipeline de RAG porque ya parte del mensaje traducido.

from fastapi import APIRouter
from ..models.evaluacion import EvaluacionRequest

router = APIRouter()

@router.post("/evaluar_respuesta")
async def evaluar_respuesta(request: EvaluacionRequest):
    """
    Endpoint de evaluacion de respuesta.
    - Recibe JSON con 'mensaje' y 'respuesta'.
    - Validacion via Pydantic.
    - Logica de scoring pendiente.
    """
    return {
        "status": "ok",
        "mensaje_recibido": request.mensaje,
        "respuesta_recibida": request.respuesta,
        "info": "Aqui se evaluaria la respuesta mas adelante."
    }
