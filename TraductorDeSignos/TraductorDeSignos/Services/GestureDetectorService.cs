//Servicio CORE encargado de detectar y clasificar gestos.
//  - Recibe keypoints crudos desde CameraHub
//  - Compara contra firmas matemáticas ya entrenadas
//  - Aplica similitud coseno + umbral
//  - Devuelve un DetectionResult limpio y semántico
using System.Text.Json;
using TraductorDeSignos.Interfaces;
using TraductorDeSignos.Models;

namespace TraductorDeSignos.Services
{
    /*
     * Servicio responsable de la detección de gestos a partir de keypoints.
     * --------------------------------------------------------------------
     * - Recibe frames normalizados (42 valores)
     * - Calcula distancias contra firmas conocidas
     * - Aplica umbrales, confianza, separación y consenso temporal
     * - Devuelve un DetectionResult cuando hay detección válida
     */
    public class GestureDetectorService : IGestureDetectorService
    {
        // Logger para trazas, depuración y métricas
        private readonly ILogger<GestureDetectorService> _logger;

        // Colección inmutable de gestos cargados desde el servicio de firmas
        private readonly IReadOnlyCollection<GestureSignature> _gestures;

        // ===================== CONFIGURACIÓN =====================

        // Relación mínima entre el mejor candidato y el segundo
        // Evita detecciones ambiguas
        private const double MINIMUM_SEPARATION_RATIO = 1.8;

        // Número de frames considerados para el sistema de consenso
        private const int CONSENSUS_WINDOW = 5;

        // Número mínimo de votos iguales para confirmar un gesto
        private const int REQUIRED_CONSENSUS = 3;

        // Confianza mínima aceptada para la demo
        private const double MIN_CONFIDENCE_FOR_DEMO = 0.70;

        // ===================== SISTEMA DE CONSENSO =====================

        // Cola circular con las detecciones recientes
        private readonly Queue<string> _recentDetections = new(capacity: CONSENSUS_WINDOW);

        // Último gesto confirmado
        private string? _lastConfirmedGesture = null;

        // Momento de la última detección confirmada
        private DateTime _lastDetectionTime = DateTime.MinValue;

        // Tiempo mínimo entre detecciones iguales
        private const int COOLDOWN_MS = 1500;

        /*
         * Constructor del detector.
         * - Obtiene las firmas desde el servicio de firmas
         * - Valida que existan gestos cargados
         */
        public GestureDetectorService(
            IGestureSignatureService signatureService,
            ILogger<GestureDetectorService> logger)
        {
            _logger = logger;
            _gestures = signatureService.GetAll();

            // Si no hay gestos cargados, el detector no puede funcionar
            if (_gestures.Count == 0)
            {
                throw new InvalidOperationException("No se cargaron gestos. Verifica los archivos JSON.");
            }

            // Logs de arranque y configuración
            _logger.LogInformation($"GestureDetectorService listo ({_gestures.Count} gestos cargados)");
            _logger.LogInformation(
                $"Config: Separación={MINIMUM_SEPARATION_RATIO:F2}x, " +
                $"Consenso={REQUIRED_CONSENSUS}/{CONSENSUS_WINDOW}, " +
                $"Cooldown={COOLDOWN_MS}ms, " +
                $"MinConf={MIN_CONFIDENCE_FOR_DEMO:P0}"
            );

            // Log de umbrales por gesto
            foreach (var g in _gestures)
            {
                _logger.LogInformation($"'{g.Nombre}': umbral={g.Umbral:F4}");
            }
        }

        // ===================== API PRINCIPAL =====================

        /*
         * Procesa un frame de keypoints y devuelve un resultado de detección.
         */
        public Task<DetectionResult?> ProcessFrame(double[] keypoints)
        {
            // Validación básica de entrada
            if (keypoints == null || keypoints.Length != 42)
            {
                _logger.LogWarning(
                    $"Keypoints inválidos: longitud={keypoints?.Length ?? 0} (esperado: 42)"
                );
                return Task.FromResult<DetectionResult?>(DetectionResult.NoDetection());
            }

            // Caso típico de mano no detectada (todos los valores casi cero)
            if (keypoints.All(k => Math.Abs(k) < 0.001))
            {
                _logger.LogWarning("Keypoints con valores casi cero - mano no detectada");
                ResetConsensus();
                return Task.FromResult<DetectionResult?>(DetectionResult.NoDetection());
            }

            // Normalización del frame
            var normalizedKeypoints = NormalizeKeypoints(keypoints);

            // Cálculo de distancias contra todas las firmas
            var candidates = CalculateDistances(normalizedKeypoints);

            if (candidates.Count == 0)
            {
                _logger.LogError("No hay candidatos válidos");
                return Task.FromResult<DetectionResult?>(DetectionResult.NoDetection());
            }

            // Mejor candidato y segundo mejor
            var best = candidates[0];
            var secondBest = candidates.Count > 1
                ? candidates[1]
                : (gesture: best.gesture, distance: double.MaxValue);

            // Log informativo de candidatos
            LogCandidates(candidates, best, secondBest);

            // Validación por umbral
            if (best.distance > best.gesture.Umbral)
            {
                ResetConsensus();
                return Task.FromResult<DetectionResult?>(DetectionResult.NoDetection());
            }

            // Cálculo de confianza
            double confidence = Math.Max(0, 1.0 - (best.distance / best.gesture.Umbral));
            if (confidence < MIN_CONFIDENCE_FOR_DEMO)
            {
                ResetConsensus();
                return Task.FromResult<DetectionResult?>(DetectionResult.NoDetection());
            }

            // Separación entre primer y segundo candidato
            double separationRatio = secondBest.distance / best.distance;
            if (separationRatio < MINIMUM_SEPARATION_RATIO)
            {
                ResetConsensus();
                return Task.FromResult<DetectionResult?>(DetectionResult.NoDetection());
            }

            // Paso al sistema de consenso temporal
            return ProcessConsensus(best, separationRatio, confidence);
        }

        // ===================== NORMALIZACIÓN =====================

        /*
         * Normaliza los keypoints:
         * - Centra restando la media
         * - Divide por la norma para eliminar escala
         */
        private double[] NormalizeKeypoints(double[] keypoints)
        {
            double mean = keypoints.Average();
            var centered = keypoints.Select(k => k - mean).ToArray();

            double norm = Math.Sqrt(centered.Sum(k => k * k));
            if (norm < 0.000001)
            {
                return centered;
            }

            return centered.Select(k => k / norm).ToArray();
        }

        // ===================== MÉTODOS AUXILIARES =====================

        /*
         * Log informativo de candidatos para depuración.
         */
        private void LogCandidates(
           List<(GestureSignature gesture, double distance)> candidates,
                (GestureSignature gesture, double distance) best,
                (GestureSignature gesture, double distance) secondBest)
                {
                    _logger.LogDebug(
                    $"Mejor: '{best.gesture.Nombre}' (dist={best.distance:F4}, umbral={best.gesture.Umbral:F4}), " +
                    $"Segundo: '{secondBest.gesture.Nombre}' (dist={secondBest.distance:F4})"
           );
        }

        /*
         * Calcula la distancia euclídea entre el frame y cada firma
     * y devuelve la lista ordenada por distancia ascendente.
   */
        private List<(GestureSignature gesture, double distance)> CalculateDistances(double[] keypoints)
        {
            var results = new List<(GestureSignature gesture, double distance)>();

            foreach (var gesture in _gestures)
            {
                try
                {
                    double distance = EuclideanDistance(keypoints, gesture.FirmaPromedio);
                    if (!double.IsNaN(distance) && !double.IsInfinity(distance))
                    {
                        results.Add((gesture, distance));
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        $"Error calculando distancia para '{gesture.Nombre}': {ex.Message}"
                    );
                }
            }

            return results.OrderBy(r => r.distance).ToList();
        }

        /*
         * Sistema de consenso temporal basado en votación.
         */
        private Task<DetectionResult?> ProcessConsensus(
            (GestureSignature gesture, double distance) best,
            double separationRatio,
            double confidence)
        {
            _recentDetections.Enqueue(best.gesture.Nombre);
            if (_recentDetections.Count > CONSENSUS_WINDOW)
                _recentDetections.Dequeue();

            var votes = _recentDetections
                .GroupBy(x => x)
                .Select(g => (gesture: g.Key, count: g.Count()))
                .OrderByDescending(v => v.count)
                .ToList();

            var winner = votes.First();

            if (winner.count >= REQUIRED_CONSENSUS)
            {
                if (IsInCooldown(winner.gesture))
                {
                    return Task.FromResult<DetectionResult?>(DetectionResult.NoDetection());
                }

                return ConfirmDetection(
                    winner.gesture,
                    best.distance,
                    best.gesture.Umbral,
                    separationRatio,
                    winner.count,
                    confidence
                );
            }

            return Task.FromResult<DetectionResult?>(DetectionResult.NoDetection());
        }

        /*
         * Comprueba si el gesto está en cooldown.
         */
        private bool IsInCooldown(string gesture)
        {
            if (_lastConfirmedGesture == gesture)
            {
                var elapsed = (DateTime.Now - _lastDetectionTime).TotalMilliseconds;
                return elapsed < COOLDOWN_MS;
            }
            return false;
        }

        /*
         * Confirma definitivamente la detección y construye el DetectionResult.
         */
        private Task<DetectionResult?> ConfirmDetection(
            string gestureName,
            double distance,
            double threshold,
            double separation,
            int voteCount,
            double confidence)
        {
            _lastConfirmedGesture = gestureName;
            _lastDetectionTime = DateTime.Now;
            _recentDetections.Clear();

            string state = GestureState.GetState(confidence, separation);

            return Task.FromResult<DetectionResult?>(
                new DetectionResult(
                    detected: true,
                    gestureName: gestureName,
                    similarity: confidence,
                    threshold: threshold,
                    state: state,
                    separation: separation,
                    distance: distance
                )
            );
        }

        /*
         * Reinicia el sistema de consenso.
         */
        private void ResetConsensus()
        {
            if (_recentDetections.Count > 0)
            {
                _recentDetections.Clear();
            }
        }

        /*
         * Cálculo clásico de distancia euclídea entre dos vectores.
         */
        private double EuclideanDistance(double[] a, double[] b)
        {
            if (a.Length != b.Length)
            {
                throw new ArgumentException(
                    $"Dimensiones incompatibles: {a.Length} vs {b.Length}"
                );
            }

            double sum = 0;
            for (int i = 0; i < a.Length; i++)
            {
                double diff = a[i] - b[i];
                sum += diff * diff;
            }

            return Math.Sqrt(sum);
        }
    }
}
