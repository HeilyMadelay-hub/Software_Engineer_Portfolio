using System.Text.Json;
using TraductorDeSignos.Interfaces;
using TraductorDeSignos.Models;

namespace TraductorDeSignos.Services
{

    /*
     
     Servicio responsable de la gestión de firmas de gestos.
     - Carga las firmas desde archivos JSON
     - Las mantiene en memoria
     - Permite consultarlas por nombre o como colección
    
    NO detecta gestos.
    NO aplica algoritmos.
    Solo gestiona datos (patrones).
     
     */
    public class GestureSignatureService : IGestureSignatureService
    {

        private readonly List<GestureSignature> _signatures; //Una lista para guardar los gestos en memoria
        private readonly IWebHostEnvironment _env;//El entorno web se inyecta para resolver rutas físicas de forma portable.


        public GestureSignatureService(IWebHostEnvironment env)
        {
            _env = env;

            // La carga de firmas desde el json es responsabilidad del servicio de firmas,
            // no del detector ni del Hub.
            // Las firmas se cargan una vez en memoria para evitar I/O en cada frame
            _signatures = LoadSignaturesFromJson();
        }

        // Devuelve todas las firmas disponibles como colección de solo lectura.
        // Evita que capas externas puedan modificar el estado interno con AsReadOnly
        public IReadOnlyCollection<GestureSignature> GetAll()
        => _signatures.AsReadOnly();

        // Devuelve una firma concreta por su nombre.
        public GestureSignature? GetByName(string gestureName)
            => _signatures.FirstOrDefault(g => g.Nombre == gestureName);



        //Carga todas las firmas de gestos desde archivos JSON ubicados en wwwroot/gestures.
        private List<GestureSignature> LoadSignaturesFromJson( )
        {
            var gesturesPath = Path.Combine(
                _env.WebRootPath,   // wwwroot
                "gestures"         // carpeta donde están los JSON
            );

            //Si no existe funciona pero sin gestos cargados
            if (!Directory.Exists(gesturesPath))
                return new List<GestureSignature>();

            var signatures = new List<GestureSignature>();

            // Se carga cada archivo JSON como una firma independiente. Esto permite añadir gestos sin recompilar el backend.
            foreach (var file in Directory.GetFiles(gesturesPath, "*.json"))
            {
                var json = File.ReadAllText(file);
                var signature = JsonSerializer.Deserialize<GestureSignature>(json);

                if (signature != null)
                    signatures.Add(signature);
            }

            return signatures;
        }


    }
}
