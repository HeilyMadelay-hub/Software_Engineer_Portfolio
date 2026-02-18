from pydantic import BaseModel, Field

class TraduccionRequest(BaseModel):
    # Modelo para el endpoint /traducir, con validación incluida.

    mensaje: str = Field(
        ...,                # Campo obligatorio
        min_length=1,       # El mensaje no puede estar vacío
        max_length=512      # Limita la longitud máxima para evitar inputs demasiado largos
    )
    # Pydantic validará automáticamente:
    # - Que 'mensaje' esté presente en el JSON
    # - Que sea un string
    # - Que cumpla las restricciones de longitud
