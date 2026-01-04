using Microsoft.AspNetCore.SignalR;
using TraductorDeSignos.Interfaces;
using TraductorDeSignos.Models;

namespace TraductorDeSignos.Hubs
{
    /* CameraHub - Hub de comunicación en tiempo real entre la cámara (cliente) y el motor de reconocimiento de gestos.
   
    Actúa como puente en tiempo real entre:
      -  El cliente que captura keypoints (MediaPipe / OpenPose / etc.)
      - El motor de detección de gestos
      -  Los clientes consumidores (UI, estadísticas, dashboards)
     Su función principal es: Recibir keypoints frame a frame, procesarlos, detectar gestos 
     y emitir eventos en tiempo real a todos los clientes conectados.
  
   
    CameraHub NO reconoce gestos - CameraHub ORQUESTA el reconocimiento en tiempo real.
    Es la capa nerviosa del sistema: Recibe señales, activa el cerebro y comunica resultados.
    */
    public class CameraHub : Hub
    {
        // IGestureDetectorService: Núcleo lógico del reconocimiento.
        // Responsable de: Procesar cada frame, comparar firmas, mantener estado temporal del gesto,
        // y decidir si un gesto ha sido detectado.
        private readonly IGestureDetectorService _gestureDetectorService;

        // IGestureSignatureService: Servicio encargado de gestionar las firmas de gestos (carga, cache, versionado).
        // Abstrae el almacenamiento (JSON, DB, etc.). Preparado para extensiones futuras.
        private readonly IGestureSignatureService _signatureService;

        // ILogger: Sistema de logging estructurado para depuración, demos, auditoría y métricas de calidad.
        private readonly ILogger<CameraHub> _logger;



        public CameraHub(
           IGestureDetectorService gestureDetectorService,  // Inyección del núcleo lógico de reconocimiento
           IGestureSignatureService signatureService,        // Inyección del gestor de firmas (extensibilidad futura)
           ILogger<CameraHub> logger)            // Inyección del sistema de logging estructurado
        {
            _gestureDetectorService = gestureDetectorService; // Asignación del servicio detector
            _signatureService = signatureService;      // Asignación del servicio de firmas
            _logger = logger;                // Asignación del logger
        }

        /*Método principal invocado por el cliente para enviar keypoints de la cámara en tiempo real.
         Cada llamada representa UN FRAME de la captura de video.
        Flujo conceptual:
       1. Normalización de keypoints
       2. Cálculo del vector de firma observado
       3. Comparación con firmas conocidas
      4. Evaluación de umbrales
     5. Análisis temporal (estado del gesto)
        
        */
        public async Task ReceiveKeypoints(double[] keypoints)//Array de coordenadas (x,y) de 21 landmarks de la mano = 42 valores
        {
            //  Log visual separador para facilitar debugging y seguimiento en consola
            _logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

            // Log diagnóstico: Verificar flujo de datos y longitud recibida
            _logger.LogInformation($" Longitud de Keypoints recibidos: {keypoints?.Length ?? 0}");

            // VALIDACIÓN CRÍTICA: Se esperan 21 puntos × (x, y) = 42 valores
            // Motivo: Evita errores matemáticos silenciosos y protege al motor de entradas corruptas
            if (keypoints == null || keypoints.Length != 42)
            {
                //  Log de advertencia cuando la entrada no cumple el formato esperado
                _logger.LogWarning($"Longitud incorrecta: {keypoints?.Length ?? 0}");
                return; // Salida temprana - no procesar frames corruptos
            }

            //  Log diagnóstico: Primeros 6 valores para debug visual rápido y demostraciones en vivo
            _logger.LogInformation($"Primeros 6 valores: [{string.Join(", ", keypoints.Take(6).Select(k => k.ToString("F3")))}]");

            // PROCESAMIENTO DEL FRAME: Llamada al núcleo de reconocimiento
            // Aquí ocurre: normalización, cálculo de firma, comparación, evaluación de umbrales y análisis temporal
            var result = await _gestureDetectorService.ProcessFrame(keypoints);

            // PROTECCIÓN ante resultado nulo: Fallos internos, frames incompletos o estados no evaluables
            if (result == null)
            {
                _logger.LogWarning("Resultado NULL"); // Log de advertencia por resultado no válido
                return; // Salida temprana - no continuar sin resultado
            }

            // GESTO DETECTADO: Solo cuando el sistema está seguro se ejecuta la emisión
            if (result.Detected)
            {
                // Log avanzado para demos: Convierte datos técnicos en feedback humano inmediato
                LogForDemo(result.GestureName, result.Similarity, result.State, result.Separation);

                // PAYLOAD del evento GestureDetected
                // Estructura de datos enviada a todos los clientes conectados
                var gestureData = new
                {
                    gestureName = result.GestureName,   // Nombre del gesto reconocido
                    similarity = result.Similarity,     // Nivel de similitud (0-1) - qué tanto ha acertado
                    threshold = result.Threshold,     // Umbral aplicado - por qué se detectó o no
                    state = result.State,               // Estado del gesto (inicio, estable, salida, etc.)
                    separation = result.Separation,     // Separación respecto a otros gestos candidatos
                    isClear = result.IsClearGesture,    // Indica si el gesto es claro o ambiguo
                    distance = result.Distance    // Distancia matemática real (euclidiana)
                };

                // EMISIÓN A TODOS LOS CLIENTES: Clients.All en lugar de Clients.Caller
                // Razón: Permite múltiples vistas simultáneas (Cámara, Estadísticas, Dashboard)
                // Funciona incluso en pestañas distintas del navegador
                // Ideal para demos y monitorización en tiempo real
                await Clients.All.SendAsync("GestureDetected", gestureData);

                // 🪵 Log de confirmación de emisión del evento
                _logger.LogInformation($"📡 Evento GestureDetected enviado a TODOS los clientes");
            }
        }


        // Método de logging avanzado orientado a demos y debugging visual.
        // Su objetivo es transformar métricas técnicas en información clara,
        // legible y comprensible para humanos durante una demostración.
        private void LogForDemo(string gesture, double confidence, string state, double separation)
        {
            // Obtiene una representación visual del estado del gesto
            // (por ejemplo: inicio, estable, transición, ruido)
            string stateEmoji = GestureState.GetEmoji(state);

            // Obtiene una descripción textual del estado del gesto
            string stateDesc = GestureState.GetDescription(state);

            // Clasificación visual de la calidad del reconocimiento
            // basada exclusivamente en el nivel de confianza
            string qualityEmoji = confidence switch
            {
                >= 0.85 => "VERDE",     // Confianza muy alta
                >= 0.75 => "AMARILLO",  // Confianza buena
                >= 0.65 => "NARANJA",   // Confianza aceptable
                _ => "ADVERTENCIA"      // Confianza baja
            };

            // Clasificación textual del nivel de confianza
            // para facilitar la lectura en los logs
            string confidenceLevel = confidence switch
            {
                >= 0.85 => "EXCELENTE",   // Reconocimiento muy preciso
                >= 0.75 => "BUENA",       // Reconocimiento fiable
                >= 0.65 => "ACEPTABLE",   // Reconocimiento justo
                _ => "BAJA"               // Reconocimiento poco fiable
            };

            // Log estructurado que muestra toda la información relevante
            // del gesto detectado en una sola línea
            _logger.LogInformation(
                $"{qualityEmoji} Gesto '{gesture}' | " +
                $"Confianza: {confidenceLevel} ({confidence:P0}) | " +
                $"{stateDesc} | " +
                $"Separación: {separation:F2}x"
            );
        }


        // Método que se ejecuta cuando un cliente se conecta al Hub.
        // Se utiliza para monitorizar conexiones activas y depurar el sistema.
        public override Task OnConnectedAsync()
        {
            // Log de conexión con el identificador único del cliente
            _logger.LogInformation($"Cliente conectado: {Context.ConnectionId}");

            // Llamada al método base para mantener el comportamiento estándar de SignalR
            return base.OnConnectedAsync();
        }

        // Método que se ejecuta cuando un cliente se desconecta del Hub.
        // Permite detectar desconexiones normales o inesperadas.
        public override Task OnDisconnectedAsync(Exception? exception)
        {
            // Log de desconexión con el identificador del cliente
            _logger.LogInformation($"Cliente desconectado: {Context.ConnectionId}");

            // Llamada al método base para liberar recursos correctamente
            return base.OnDisconnectedAsync(exception);
        }
    }
}