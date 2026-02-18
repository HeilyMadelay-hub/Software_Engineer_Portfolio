from pydantic import BaseModel, Field
# Importa BaseModel de Pydantic para definir modelos de datos con validación automática.
# Importa Field para agregar restricciones y metadata a cada atributo del modelo.

class EvaluacionRequest(BaseModel):
    # Define un modelo de request para el endpoint /evaluar_respuesta.
    # Hereda de BaseModel, lo que permite validación automática de tipos y restricciones.

    mensaje: str = Field(..., min_length=1, max_length=512)
    # Atributo 'mensaje' (string) que representa el mensaje traducido ya procesado por /traducir.
    # Field(...) indica que es obligatorio.
    # min_length=1 asegura que no esté vacío.
    # max_length=512 evita inputs excesivamente largos que podrían romper el pipeline.

    respuesta: str = Field(..., min_length=1, max_length=512)
    # Atributo 'respuesta' (string) que representa la respuesta propuesta por el usuario.
    # Field(...) indica que es obligatorio.
    # min_length=1 asegura que el usuario haya ingresado algo.
    # max_length=512 limita la longitud para evitar sobrecarga o errores de procesamiento.
