using TraductorDeSignos.Models;


/*    
    Define cómo gestionamos las firmas de los gestos (los patrones que el algoritmo usa para reconocer cada gesto).

    Qué hace:

    Devuelve todas las firmas disponibles.

    Devuelve una firma concreta por su nombre.

    Permite guardar/actualizar una firma.

    Permite eliminar una firma.

    Por qué existe:

    Separar gestión de patrones de la lógica de detección.

    Que el detector no tenga que saber si los gestos vienen de JSON, base de datos o cualquier otra fuente.

    Facilita pruebas unitarias: puedes mockear los gestos.

    En pocas palabras:

    “Yo solo guardo y devuelvo patrones de gestos, no hago detección.”
*/

namespace TraductorDeSignos.Interfaces
{
   
    public interface IGestureSignatureService
    {
    
        // Devuelve todas las firmas de gestos disponibles en el sistema.
        IReadOnlyCollection<GestureSignature> GetAll();

        // Obtiene una firma concreta por su nombre.
        GestureSignature? GetByName(string gestureName);
    }

}

