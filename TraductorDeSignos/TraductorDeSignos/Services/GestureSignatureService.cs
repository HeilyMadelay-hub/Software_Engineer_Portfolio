using System.Text.Json;                          // Serialización / deserialización JSON
using TraductorDeSignos.Interfaces;              // Interfaz del servicio
using TraductorDeSignos.Models;                  // Modelo GestureSignature

namespace TraductorDeSignos.Services
{
    /*
     * Servicio responsable de la gestión de firmas de gestos.
     * -------------------------------------------------------
     * Carga las firmas desde archivos JSON
     * Las mantiene en memoria
     * Permite consultarlas por nombre o como colección
     *
     * NO detecta gestos
     * NO aplica algoritmos
     *
     * Su única responsabilidad es gestionar datos (patrones).
     */
    public class GestureSignatureService : IGestureSignatureService
    {
        // Lista privada donde se almacenan todas las firmas cargadas en memoria.
        // Se usa List<T> internamente por eficiencia y flexibilidad.
        private readonly List<GestureSignature> _signatures;

        // Entorno web (wwwroot, rutas físicas, etc.)
        // Se inyecta para que el servicio sea portable y no dependa de rutas hardcodeadas.
        private readonly IWebHostEnvironment _env;

        /*
         * Constructor del servicio.
         * Se ejecuta una sola vez al arrancar la aplicación (scope Singleton / Scoped).
         *
         * - Recibe el entorno web para resolver rutas físicas
         * - Recibe el logger para trazas y depuración
         * - Carga las firmas desde JSON y las deja en memoria
         */
        public GestureSignatureService(
            IWebHostEnvironment env,
            ILogger<GestureSignatureService> logger)
        {
            _env = env;

            // La carga de firmas es responsabilidad exclusiva de este servicio.
            // Se hace una sola vez para evitar I/O continuo en tiempo real.
            _signatures = LoadSignaturesFromJson(logger);
        }

        /*
         * Devuelve todas las firmas disponibles.
         *
         * IReadOnlyCollection evita que capas externas
         * puedan modificar el estado interno del servicio.
         */
        public IReadOnlyCollection<GestureSignature> GetAll()
            => _signatures.AsReadOnly();

        /*
         * Devuelve una firma concreta por su nombre.
         *
         * - Si existe, devuelve el objeto GestureSignature
         * - Si no existe, devuelve null
         */
        public GestureSignature? GetByName(string gestureName)
            => _signatures.FirstOrDefault(g => g.Nombre == gestureName);

        // ===================== CARGA DE JSON =====================

        /*
         * Carga todas las firmas de gestos desde archivos JSON.
         *
         * Ruta esperada:
         * wwwroot/gestures/*.json
         *
         * Cada archivo representa un gesto.
         */
        private List<GestureSignature> LoadSignaturesFromJson(ILogger logger)
        {
            // Construye la ruta física a la carpeta de gestos
            var gesturesPath = Path.Combine(
                _env.WebRootPath ?? "wwwroot",
                "gestures"
            );

            // Si la carpeta no existe, se registra un error y se devuelve una lista vacía
            if (!Directory.Exists(gesturesPath))
            {
                logger.LogError($"❌ Carpeta de gestos no encontrada: {gesturesPath}");
                return new List<GestureSignature>();
            }

            // Lista temporal donde se irán cargando las firmas
            var signatures = new List<GestureSignature>();

            // Recorre todos los archivos JSON de la carpeta
            foreach (var file in Directory.GetFiles(gesturesPath, "*.json"))
            {
                try
                {
                    // Lee el contenido del archivo
                    var json = File.ReadAllText(file);

                    // Deserializa directamente a GestureSignature
                    var signature = JsonSerializer.Deserialize<GestureSignature>(json);

                    // Si la deserialización fue correcta
                    if (signature != null)
                    {
                        // Log informativo del gesto cargado
                        // IMPORTANTE: se usa el umbral definido en el JSON
                        logger.LogInformation(
                            $"Gesto '{signature.Nombre}' | " +
                            $"Umbral: {signature.Umbral:F4}"
                        );

                        // Se añade la firma a la colección en memoria
                        signatures.Add(signature);
                    }
                }
                catch (Exception ex)
                {
                    // Cualquier error de lectura o parseo se captura y se registra
                    logger.LogError($" Error cargando {file}: {ex.Message}");
                }
            }

            // Log final indicando cuántos gestos se han cargado
            logger.LogInformation($"Total gestos cargados: {signatures.Count}");

            // Se devuelve la lista completa
            return signatures;
        }
    }
}
