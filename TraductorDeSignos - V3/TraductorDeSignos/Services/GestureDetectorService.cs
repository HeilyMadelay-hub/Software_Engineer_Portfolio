using TraductorDeSignos.Interfaces;
using TraductorDeSignos.Models;

namespace TraductorDeSignos.Services
{
    /*

      Servicio CORE encargado de detectar y clasificar gestos.

      - Recibe keypoints crudos desde CameraHub
      - Compara contra firmas matemáticas ya entrenadas
      - Aplica similitud coseno + umbral
      - Devuelve un DetectionResult limpio y semántico

      ESTE servicio:
       Contiene la lógica matemática
       No conoce SignalR
       No conoce frontend
       No gestiona almacenamiento de firmas

      */
    public class GestureDetectorService : IGestureDetectorService
    {
        private readonly IGestureSignatureService _signatureService;

        // Se inyecta la interfaz, no la implementación,
        // aplicando el Principio de Inversión de Dependencias (DIP)
        public GestureDetectorService(IGestureSignatureService signatureService)
        {
            _signatureService = signatureService;
        }

        /*
         
         Procesa un frame de keypoints y determina
         si corresponde a algún gesto conocido.
         
         Input:
         - keypoints: array (x,y,z) de 21 o 42 landmarks
         
         Output:
         - DetectionResult con:
             - si hay detección
             - nombre del gesto
             - similitud obtenida
             - umbral usado
         
         */
        public Task<DetectionResult?> ProcessFrame(double[] keypoints)
        {
            // Validación mínima estructural
            if (keypoints == null || keypoints.Length == 0)
                return Task.FromResult<DetectionResult?>(DetectionResult.NoDetection());

            DetectionResult bestResult = DetectionResult.NoDetection();

            // Se comparan los keypoints contra TODAS las firmas disponibles
            foreach (var gesture in _signatureService.GetAll())
            {
                if (gesture.FirmaPromedio == null || gesture.FirmaPromedio.Length == 0)
                    continue; // saltar gestos inválidos

                // Cálculo de similitud coseno entre:
                // - keypoints actuales
                // - firma promedio del gesto
                double similarity = CalculateCosineSimilarity(
                    keypoints,
                    gesture.FirmaPromedio
                );

                // Criterio de detección:
                // similitud >= umbral del gesto
                // y mayor que cualquier detección previa
                if (similarity >= gesture.Umbral &&
                    similarity > bestResult.Similarity)
                {
                    bestResult = new DetectionResult(
                        detected: true,
                        gestureName: gesture.Nombre,
                        similarity: similarity,
                        threshold: gesture.Umbral
                    );
                }
            }

            return Task.FromResult<DetectionResult?>(bestResult);
        }

        /*
         
         Similitud coseno entre dos vectores:
         
         sim(a, b) = (a · b) / (||a|| * ||b||)
         
         - Compara DIRECCIÓN del movimiento
         - Ignora magnitud absoluta
         - Ideal para espacios de alta dimensión
         
         */
        private double CalculateCosineSimilarity(double[] a, double[] b)
        {
            // Comprobación de seguridad:
            // Ambos vectores deben vivir en el mismo espacio dimensional.
            // Si no, la similitud no tiene sentido matemático.
            if (a.Length != b.Length)
                return 0.0;

            // Producto escalar entre los dos vectores.
            // Mide cuánto apuntan en la misma dirección.
            double dot = 0.0;
            // Norma (longitud) del vector 'a'.
            // Se usa para normalizar el producto escalar.
            double normA = 0.0;
            // Norma (longitud) del vector 'b'.
            double normB = 0.0;

            // Recorremos cada dimensión del vector
            for (int i = 0; i < a.Length; i++)
            {
                // Acumulamos el producto escalar:
                // suma(a_i * b_i)
                dot += a[i] * b[i];
                // Acumulamos el cuadrado de cada componente de 'a'
                // para calcular su norma (||a||)
                normA += a[i] * a[i];
                // Acumulamos el cuadrado de cada componente de 'b'
                // para calcular su norma (||b||)
                normB += b[i] * b[i];
            }

            // Si alguno de los vectores tiene norma cero,
            // no se puede normalizar (evita división por cero).
            if (normA == 0 || normB == 0)
                return 0.0;


            // El resultado está acotado en [-1, 1]:
            //  1   -> vectores alineados (máxima similitud)
            //  0   -> vectores ortogonales (sin relación)
            // -1   -> vectores opuestos
            return dot / (Math.Sqrt(normA) * Math.Sqrt(normB));
        }

        //Usamos similitud coseno porque compara la dirección dominante del movimiento
        //y no su magnitud, lo que hace el sistema robusto a variaciones de velocidad y
        //amplitud del gesto

    }
}
