// STATISTICS MODULE
// Responsabilidad:
// 1. Escuchar eventos de gestos detectados
// 2. Actualizar métricas y estadísticas en tiempo real
// 3. Gestionar gráficos con Chart.js
// 4. Manejar el historial de detecciones

(function () {
    // VARIABLES DE ESTADO
    let isPaused = false;//Controla si el sistema está pausado. Cuando es true, ignora nuevas detecciones de gestos.
    let totalDetections = 0;//Contador acumulativo de todos los gestos detectados durante la sesión.
    let confidenceSum = 0;//Suma acumulada de todos los valores de confianza. Se usa para calcular el promedio: confidenceSum / totalDetections.
    let gestureFrequency = {};//Diccionario {gesto: cantidad}. Ej: {"A": 5, "B": 3}. Alimenta el gráfico de barras.
    let currentStreak = 0;//Racha actual: cuántas veces consecutivas se detectó el mismo gesto.
    let maxStreak = 0;//Racha máxima alcanzada en la sesión.
    let lastGesture = null;//Último gesto detectado. Se compara con el nuevo para determinar si continúa la racha.
    let lastDetectionTime = null;//Timestamp de la última detección. Calcula el tiempo entre detecciones.
    let speedSum = 0;//Suma de milisegundos entre detecciones consecutivas.
    let speedCount = 0;//Cantidad de intervalos medidos. Promedio = speedSum / speedCount.
    let fpsSum = 0;//Suma acumulada de FPS medidos cada segundo.
    let fpsCount = 0;//Cantidad de mediciones de FPS. Promedio = fpsSum / fpsCount.
    let detectionHistory = [];//Últimas N detecciones (objetos con id, gesto, confianza, etc.). Alimenta la tabla de historial.
    let confidenceHistory = [];//Últimos N valores de confianza. Alimenta el gráfico de línea.

    // Configuración
    const MAX_HISTORY_ITEMS = 10;//Máximo de filas en la tabla de historial (las más antiguas se eliminan).
    const MAX_CONFIDENCE_POINTS = 20;//Máximo de puntos en el gráfico de evolución de confianza.

    // REFERENCIAS A ELEMENTOS DEL DOM
    const elements = {
        // Métricas principales para el panel de estadísticas generales
        totalDetections: document.getElementById('totalDetections'),
        avgConfidence: document.getElementById('avgConfidence'),
        confidenceBar: document.getElementById('confidenceBar'),
        mostUsed: document.getElementById('mostUsed'),
        currentStreak: document.getElementById('currentStreak'),
        maxStreak: document.getElementById('maxStreak'),
        avgSpeed: document.getElementById('avgSpeed'),
        avgFps: document.getElementById('avgFps'),

        // Quick stats que indican rapidamente en tiempo real el gesto actual detectado

        quickGesture: document.getElementById('quickGesture'),
        quickConfidence: document.getElementById('quickConfidence'),
        quickFps: document.getElementById('quickFps'),

        // Gesture display, es la muestra visual del gesto actual detectado
        gestureDisplay: document.getElementById('gesture-display'),

        // Historial
        historialBody: document.getElementById('historialBody'),

        // Controles
        btnReset: document.getElementById('btnReset'),
        btnExport: document.getElementById('btnExport'),
        btnPause: document.getElementById('btnPause'),

        // Estado para indicar el estado visual
        statusDot: document.getElementById('statusDot'),
        statusText: document.getElementById('statusText'),
        badgeLive: document.getElementById('badgeLive'),
        badgeLiveDot: document.getElementById('badgeLiveDot'),
        badgeLiveIcon: document.getElementById('badgeLiveIcon'),
        badgeLiveText: document.getElementById('badgeLiveText')

        /*
        
        gestureDetected dispara el evento.

        handleGesture... es la función que recibe el evento.

        Actualiza vars de estado, que son las internas de mi app (updateMetrics, updateCharts...) que actualizan distintos elementos de la interfaz.
        
        */
    };

    // GRÁFICOS CON CHART.JS
    let chartFrecuencia = null;
    let chartConfianza = null;

    /**
     * Inicializa los gráficos de Chart.js para visualización de estadísticas
     * Crea dos gráficos:
     * 1. Gráfico de barras para frecuencia de gestos detectados
     * 2. Gráfico de líneas para evolución de confianza en el tiempo
     */
    function initCharts() {

        // Obtener referencias a los elementos canvas del DOM
        const ctxFrecuencia = document.getElementById('graficoFrecuencia');
        const ctxConfianza = document.getElementById('graficoConfianza');

        //Verificar que existen
        if (!ctxFrecuencia || !ctxConfianza) {
            console.error('No se encontraron los canvas para los gráficos');
            return;
        }

        // Gráfico de frecuencia de gestos (barras)
        chartFrecuencia = new Chart(ctxFrecuencia, {
            type: 'bar',
            data: {
                labels: [],// Nombres de los gestos
                datasets: [{
                    label: 'Frecuencia',
                    data: [], // Número de veces detectado cada gesto
                    // Array de colores para las barras (8 colores distintos)
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)', // Índigo
                        'rgba(16, 185, 129, 0.8)', // Verde esmeralda
                        'rgba(245, 158, 11, 0.8)', // Ámbar
                        'rgba(239, 68, 68, 0.8)',  // Rojo
                        'rgba(139, 92, 246, 0.8)', // Violeta
                        'rgba(6, 182, 212, 0.8)',  // Cian
                        'rgba(236, 72, 153, 0.8)', // Rosa
                        'rgba(34, 197, 94, 0.8)'   // Verde
                    ],

                    //Con opacidad completa para mejor definición
                    borderColor: [
                        'rgba(99, 102, 241, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(139, 92, 246, 1)',
                        'rgba(6, 182, 212, 1)',
                        'rgba(236, 72, 153, 1)',
                        'rgba(34, 197, 94, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 8, // Esquinas redondeadas
                    borderSkipped: false // Aplicar radio a todas las esquinas
                }]
            },
            options: {
                // Se adapta al tamaño del contenedor
                responsive: true,
                // Permite altura personalizada
                maintainAspectRatio: false, 
                plugins: {
                    legend: {
                        // Ocultar leyenda (no es necesaria)
                        display: false
                    }
                },
                scales: {
                    y: {
                        // Eje Y comienza en 0
                        beginAtZero: true,
                        ticks: {
                            // Incrementos de 1 en 1
                            stepSize: 1,
                            color: '#6b7280'
                        },
                        grid: {
                            color: 'rgba(107, 114, 128, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            // Color gris para etiquetas
                            color: '#6b7280'
                        },
                        grid: {
                            // Sin rejilla vertical
                            display: false
                        }
                    }
                }
            }
        });

        // Gráfico de evolución de confianza (línea)
        chartConfianza = new Chart(ctxConfianza, {
            type: 'line',
            data: {
                labels: [], // Números de detección (#1, #2, #3...)
                datasets: [{
                    label: 'Confianza (%)',
                    data: [], // Valores de confianza (0-100%)
                    fill: true,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 3,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100, // Máximo 100% de confianza
                        ticks: {
                            callback: (value) => value + '%', // Añadir símbolo de porcentaje
                            color: '#6b7280'
                        },
                        grid: {
                            color: 'rgba(107, 114, 128, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#6b7280',
                            maxRotation: 0  // Etiquetas horizontales
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    /**
     * Actualiza todos los indicadores de métricas en la interfaz
     * Incluye: total de detecciones, confianza promedio, gesto más usado,
     * rachas actuales y máximas, y velocidad promedio entre detecciones
     */
    function updateMetrics() {
        // Contador de total detecciones
        if (elements.totalDetections) {
            elements.totalDetections.textContent = totalDetections;
        }

        // Calcular y mostrar confianza promedio
        const avgConf = totalDetections > 0 ? (confidenceSum / totalDetections) : 0;
        if (elements.avgConfidence) {
            elements.avgConfidence.textContent = avgConf.toFixed(0) + '%';
        }
        // Actualizar barra de progreso de confianza
        if (elements.confidenceBar) {
            elements.confidenceBar.style.width = avgConf + '%';
        }

        // Gesto más usado
        if (elements.mostUsed) {
            const mostUsedGesture = getMostUsedGesture();
            elements.mostUsed.textContent = mostUsedGesture || '-';
        }

        //Actualizar rachas (secuencia de mismo gesto)
        if (elements.currentStreak) {
            elements.currentStreak.textContent = currentStreak;
        }
        if (elements.maxStreak) {
            elements.maxStreak.textContent = maxStreak;
        }

        // Calcular y mostrar velocidad promedio entre detecciones
        if (elements.avgSpeed) {
            if (speedCount > 0) {
                const avgSpd = speedSum / speedCount;
                elements.avgSpeed.textContent = formatSpeed(avgSpd);
            } else {
                elements.avgSpeed.textContent = '-';
            }
        }
    }

    /**
     * Actualiza las estadísticas rápidas mostradas en tiempo real
     * gestureName - Nombre del gesto detectado
     * confidence - Nivel de confianza (0-100)
     */
    function updateQuickStats(gestureName, confidence) {

        if (elements.quickGesture) {
            elements.quickGesture.textContent = gestureName;
        }
        if (elements.quickConfidence) {
            elements.quickConfidence.textContent = confidence.toFixed(0) + '%';
        }
    }

    function updateGestureDisplay(gestureName, confidence) {

        if (!elements.gestureDisplay) return;

        const gestureContent = elements.gestureDisplay.querySelector('.gesture-content');

        if (gestureContent) {
            // Actualizar icono del gesto
            const icon = gestureContent.querySelector('i');
            const text = gestureContent.querySelector('.gesture-text');

            if (icon) {
                icon.className = 'bi bi-hand-index-thumb-fill';
            }
            // Actualizar texto con gesto y porcentaje de confianza
            if (text) {
                text.textContent = `${gestureName} (${confidence.toFixed(0)}%)`;
            }
        }

        // Añadir clase de animación
        elements.gestureDisplay.classList.add('gesture-detected');
        // Remover la clase después de 500ms para permitir nueva animación
        setTimeout(() => {
            elements.gestureDisplay.classList.remove('gesture-detected');
        }, 500);
    }

    function updateCharts() {
        // Actualizar gráfico de barras de frecuencia
        if (chartFrecuencia) {
            const labels = Object.keys(gestureFrequency);  // Nombres de gestos
            const data = Object.values(gestureFrequency); // Número de detecciones

            chartFrecuencia.data.labels = labels;
            chartFrecuencia.data.datasets[0].data = data;
            chartFrecuencia.update('none'); // Actualizar sin animación para mejor rendimiento
        }

        // Actualizar gráfico de confianza
        if (chartConfianza && confidenceHistory.length > 0) {
            const labels = confidenceHistory.map((_, i) => `#${i + 1}`); // Etiquetas #1, #2, #3...
            const data = confidenceHistory;  // Valores de confianza

            chartConfianza.data.labels = labels;
            chartConfianza.data.datasets[0].data = data;
            chartConfianza.update('none');
        }
    }

    /**
     * Añade una nueva detección al historial visual de la tabla
     * Mantiene un máximo de MAX_HISTORY_ITEMS filas visibles
     * detection - Objeto con datos de la detección
     */

    function updateHistorial(detection) {
        if (!elements.historialBody) return;

        // Limpiar mensaje "Esperando detecciones..." en la primera detección
        if (detectionHistory.length === 1) {
            elements.historialBody.innerHTML = '';
        }

        // Crear nueva fila
        const row = document.createElement('tr');
        row.className = 'history-row-new';  // Clase para animación de entrada


        // Determinar color según nivel de confianza
        const confidenceClass = detection.confidence >= 80 ? 'text-success' :
            detection.confidence >= 60 ? 'text-warning' : 'text-danger';

        // Construir HTML de la fila con todos los datos de la detección
        row.innerHTML = `
            <td class="ps-4 fw-bold">${detection.id}</td>
                <td>
                  <span class="badge bg-primary px-3 py-2">
                    <i class="bi bi-hand-index-thumb me-1"></i>${detection.gesture}
                  </span>
                </td>
            <td>

            <span class="fw-bold ${confidenceClass}">${detection.confidence.toFixed(0)}%</span>
            <div class="progress mt-1" style="height: 4px; width: 80px;">
               <div class="progress-bar ${confidenceClass.replace('text-', 'bg-')}" 
               style="width: ${detection.confidence}%"></div>
           </div>

           </td>
            <td class="text-muted">${detection.timestamp}</td>
            <td class="pe-4 text-muted">${detection.timeSinceLast}</td>
        `;

        //Insertar la nueva fila al principio de la tabla (más reciente arriba)
        elements.historialBody.insertBefore(row, elements.historialBody.firstChild);

        // Limitar el historial a MAX_HISTORY_ITEMS eliminando las más antiguas
        while (elements.historialBody.children.length > MAX_HISTORY_ITEMS) {
            elements.historialBody.removeChild(elements.historialBody.lastChild);
        }

        // Quitar clase de animación después de un tiempo
        setTimeout(() => {
            row.classList.remove('history-row-new');
        }, 1000);
    }

    // FUNCIONES AUXILIARES


    /**
     * Determina cuál es el gesto más detectado
     * Devuelve el nombre del gesto más usado o null si no hay datos
     */
    function getMostUsedGesture() {
        let maxCount = 0;
        let mostUsed = null;

        // Iterar sobre el objeto de frecuencias para encontrar el máximo
        for (const [gesture, count] of Object.entries(gestureFrequency)) {
            if (count > maxCount) {
                maxCount = count;
                mostUsed = gesture;
            }
        }

        return mostUsed;
    }

    //Formatea un valor de tiempo en milisegundos  o segundos con un decimal, en base si es menos de 1 segundo
    function formatSpeed(ms) {
        if (ms < 1000) {
            return ms.toFixed(0) + 'ms';
        } else {
            return (ms / 1000).toFixed(1) + 's';
        }
    }

    //Formatea un objeto Date a string de hora local
    function formatTimestamp(date) {
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }


    /**
     * Calcula el porcentaje de confianza a partir de similarity o distance
     * similarity - Valor de similitud (0-1)
     * distance - Valor de distancia (0-1)
     * 
     * Calculamos la confianza en base a lo que venga por refactorizacion por si en el futuro
     * queremos cambiar de Distancia Euclidiana (distancia entre puntos en el espacio) a KNN (K-Nearest Neighbors)
     * 
     * 
     * Los algoritmos de reconocimiento que nos pueden llegar segun variable son:
     * 
     * Similarity 
     * Correlación de coseno (cosine similarity) Mide el ángulo entre dos vectores en el espacio multidimensional; 1 = misma dirección, 0 = perpendiculares, -1 = opuestos.
     * Redes neuronales con softmax  Capa final que convierte las salidas de la red en probabilidades normalizadas que suman 1, indicando la confianza de cada clase.
     * Template matching con scores de similitud Compara una imagen/patrón contra una plantilla de referencia y devuelve un score que indica qué tan bien coinciden píxel por píxel.
     *
     * Distance 
     * 
     * Distancia Euclidiana Calcula la distancia "en línea recta" entre dos puntos en el espacio usando el teorema de Pitágoras (√[(x₂-x₁)² + (y₂-y₁)²]).
     * DTW (Dynamic Time Warping) Algoritmo que mide la similitud entre dos secuencias temporales que pueden variar en velocidad, permitiendo alinear señales deformadas en el tiempo.
     * KNN (K-Nearest Neighbors) Clasificador que asigna una clase según la distancia a los K vecinos más cercanos en el conjunto de entrenamiento.
     * Fingerpose (MediaPipe) Librería que calcula distancias entre configuraciones de dedos (extendido/doblado) para reconocer gestos de mano predefinidos. 
     */
    function calculateConfidence(similarity, distance) {
        // Si viene similarity directamente, usarlo, es   qué tan parecido es el gesto detectado al gesto de referencia 0 nada 1 perfecta
        if (similarity && similarity > 0 && similarity <= 1) {
            return similarity * 100;  // Si similarity = 0.87 el algoritmo dice que hay 87% de similitud
        }


        //Si viene distance, calcular confianza "inversa" en porcentaje de 0-100 es decir qué tan lejos está el gesto detectado del gesto de referencia
        //1 - distance  porque si distance = 0.2  (muy cerca)
        //1 - 0.2 = 0.8
        //0.8 × 100 = 80% confianza 

        if (distance && distance > 0 && distance < 1) {

            return (1 - distance) * 100;
        }

        return 0;
    }

    /**
     * Manejador principal del evento 'gestureDetected'
     * Procesa cada nuevo gesto detectado y actualiza todas las estadísticas
     * event - Evento con detalles del gesto detectado
     */
    function handleGestureDetected(event) {
        if (isPaused) return; // Si está pausado, ignorar detecciones

        const detail = event.detail;
        // Validar que el evento tenga datos válidos
        if (!detail || !detail.gestureName || detail.gestureName === 'desconocido') {
            return;
        }

        const gestureName = detail.gestureName;
        const confidence = calculateConfidence(detail.similarity, detail.distance);
        const now = new Date();

        
        totalDetections++;  // Incrementar contador total de detecciones
        confidenceSum += confidence;  // Acumular confianza para calcular promedio

        // Actualizar frecuencia de gesto detectado
        if (!gestureFrequency[gestureName]) {
            gestureFrequency[gestureName] = 0;
        }
        gestureFrequency[gestureName]++;

        // Gestionar rachas si es una secuencia del mismo gesto incrementas la racha y actualizas si no ,si es diferente lo reinicias
        if (lastGesture === gestureName) {
            currentStreak++;
            if (currentStreak > maxStreak) {
                maxStreak = currentStreak;
            }
        } else {
            currentStreak = 1;
            lastGesture = gestureName;
        }

        // Calcular tiempo transcurrido desde última detección
        let timeSinceLast = '-';
        if (lastDetectionTime) {
            const timeDiff = now - lastDetectionTime;
            speedSum += timeDiff; // Acumular para promedio
            speedCount++;
            timeSinceLast = formatSpeed(timeDiff);
        }
        lastDetectionTime = now;

        // Añadir confianza al historial para el gráfico de líneas
        confidenceHistory.push(confidence);

        // Limitar el historial a MAX_CONFIDENCE_POINTS puntos si es menor eliminas el mas antiguo
        if (confidenceHistory.length > MAX_CONFIDENCE_POINTS) {
            confidenceHistory.shift();
        }

        // Crear objeto de detección para historial visual
        const detection = {
            id: totalDetections,
            gesture: gestureName,
            confidence: confidence,
            timestamp: formatTimestamp(now),
            timeSinceLast: timeSinceLast
        };

        // Añadir al inicio del array (más reciente primero).Limitando el tamaño del historial eliminado el mas antiguo
        detectionHistory.unshift(detection);
        if (detectionHistory.length > MAX_HISTORY_ITEMS) {
            detectionHistory.pop();
        }

        // Actualizar UI
        updateMetrics();
        updateQuickStats(gestureName, confidence);
        updateGestureDisplay(gestureName, confidence);
        updateCharts();
        updateHistorial(detection);
    }


    /**
     * Reinicia todas las estadísticas y limpia la interfaz
     * Resetea contadores, gráficos, historiales y vuelve al estado inicial
     */
    function resetStatistics() {
        totalDetections = 0;
        confidenceSum = 0;
        gestureFrequency = {};
        currentStreak = 0;
        maxStreak = 0;
        lastGesture = null;
        lastDetectionTime = null;
        speedSum = 0;
        speedCount = 0;
        detectionHistory = [];
        confidenceHistory = [];

        // Actualizar UI a valores iniciales
        updateMetrics();

        // Resetear estadísticas rápidas
        if (elements.quickGesture) elements.quickGesture.textContent = '-';
        if (elements.quickConfidence) elements.quickConfidence.textContent = '0%';

        // Limpiar gráficos
        if (chartFrecuencia) {
            chartFrecuencia.data.labels = [];
            chartFrecuencia.data.datasets[0].data = [];
            chartFrecuencia.update();
        }
        if (chartConfianza) {
            chartConfianza.data.labels = [];
            chartConfianza.data.datasets[0].data = [];
            chartConfianza.update();
        }

        // Restaurar mensaje inicial en el historial
        if (elements.historialBody) {
            elements.historialBody.innerHTML = `
                      <tr>
                    <td colspan="5" class="text-center">
                  <div class="empty-state">
                    <i class="bi bi-hourglass-split d-block"></i>
            <p class="mb-0 mt-3">Esperando detecciones...</p>
                        </div>
                 </td>
                 </tr>
         `;
        }

        // Resetear el display principal de gestos
        if (elements.gestureDisplay) {
            const text = elements.gestureDisplay.querySelector('.gesture-text');
            if (text) text.textContent = 'Esperando...';
        }

        console.log('?? Estadísticas reseteadas');
    }

    /**
     * Alterna entre estado pausado y activo
     * Cuando está pausado, no se procesan nuevas detecciones
     */
    function togglePause() {
        isPaused = !isPaused;// Alternar el flag de pausa

        // Actualizar el botón de pausa/reanudar
        if (elements.btnPause) {
            const icon = elements.btnPause.querySelector('i');
            if (isPaused) {
                //Cambiar a botón de reanudar
                elements.btnPause.innerHTML = '<i class="bi bi-play-fill me-2"></i>Reanudar';
                elements.btnPause.classList.remove('btn-pause');
                elements.btnPause.classList.add('btn-success');
            } else {
                //Cambiar a botón de pausar
                elements.btnPause.innerHTML = '<i class="bi bi-pause-fill me-2"></i>Pausar';
                elements.btnPause.classList.remove('btn-success');
                elements.btnPause.classList.add('btn-pause');
            }
        }

        // Actualizar indicadores de estado
        updateStatusIndicators();

        console.log(isPaused ? '?? Estadísticas pausadas' : '?? Estadísticas reanudadas');
    }

    //Actualiza los indicadores visuales de estado del sistema. Cambia colores y textos según si está pausado o activo
    function updateStatusIndicators() {

        // Actualizar color del punto indicador de estado
        if (elements.statusDot) {
            elements.statusDot.style.background = isPaused ? '#f59e0b' : '#10b981';
        }

        // Actualizar texto de estado
        if (elements.statusText) {
            elements.statusText.textContent = isPaused ? 'Pausado' : 'Sistema Activo';
            elements.statusText.className = isPaused ? 'text-warning fw-semibold' : 'text-success fw-semibold';
        }

        // Actualizar badge "En Vivo"
        if (elements.badgeLive) {
            elements.badgeLive.style.opacity = isPaused ? '0.5' : '1';
        }
        if (elements.badgeLiveText) {
            elements.badgeLiveText.textContent = isPaused ? 'Pausado' : 'En Vivo';
        }
    }

    /**
     * Exporta todas las estadísticas a un archivo CSV
     * Incluye historial detallado de detecciones y resumen general
     */
    function exportToCSV() {
        // Validar que haya datos para exportar
        if (detectionHistory.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        // Definir encabezados del CSV
        const headers = ['ID', 'Gesto', 'Confianza (%)', 'Timestamp', 'Tiempo desde anterior'];

        // Convertir cada detección a array de valores
        const rows = detectionHistory.map(d => [
            d.id,
            d.gesture,
            d.confidence.toFixed(2),
            d.timestamp,
            d.timeSinceLast
        ]);

        // Construir contenido CSV con encabezados
        let csvContent = headers.join(',') + '\n';

        // Añadir cada fila de datos
        rows.forEach(row => {
            csvContent += row.join(',') + '\n';
        });

        // Añadir resumen
        csvContent += '\n\nResumen\n';
        csvContent += `Total Detecciones,${totalDetections}\n`;
        csvContent += `Confianza Promedio,${(confidenceSum / totalDetections).toFixed(2)}%\n`;
        csvContent += `Gesto Más Usado,${getMostUsedGesture() || '-'}\n`;
        csvContent += `Racha Máxima,${maxStreak}\n`;

        // Crear blob y descargar archivo,un blob es contenedor de datos en formato binario que puede almacenar cualquier tipo de archivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `estadisticas_gestos_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('?? Estadísticas exportadas a CSV');
    }


    //Inicia el monitor de FPS (frames por segundo). Calcula y muestra el FPS actual y promedio en tiempo real
    function startFpsMonitor() {
        let frameCount = 0;
        let lastTime = performance.now();

        //Función recursiva que calcula FPS en cada frame
        function updateFps() {
            const now = performance.now();
            const elapsed = now - lastTime;


            // Actualizar cada 1000ms (1 segundo)
            if (elapsed >= 1000) {
                const fps = Math.round((frameCount * 1000) / elapsed);
                fpsSum += fps;
                fpsCount++;

                // Actualizar FPS actual en la interfaz
                if (elements.quickFps) {
                    elements.quickFps.textContent = fps;
                }
                if (elements.avgFps) {
                    elements.avgFps.textContent = Math.round(fpsSum / fpsCount);
                }

                // Resetear contadores para el próximo segundo
                frameCount = 0;
                lastTime = now;
            }

            frameCount++;
            // Recursión: solicitar próximo frame
            requestAnimationFrame(updateFps);
        }

        // Iniciar el loop de monitoreo
        requestAnimationFrame(updateFps);
    }


    /**
     * Función principal de inicialización del módulo de estadísticas
     * Configura gráficos, event listeners y componentes iniciales
     */
    function init() {
        console.log('?? Inicializando módulo de estadísticas...');

        // Inicializar gráficos
        initCharts();

        // Escuchar eventos de gestos
        window.addEventListener('gestureDetected', handleGestureDetected);

        // Event listeners para controles
        if (elements.btnReset) {
            elements.btnReset.addEventListener('click', resetStatistics);
        }
        if (elements.btnExport) {
            elements.btnExport.addEventListener('click', exportToCSV);
        }
        if (elements.btnPause) {
            elements.btnPause.addEventListener('click', togglePause);
        }

        // Iniciar monitor de FPS
        startFpsMonitor();

        // Estado inicial
        updateStatusIndicators();

        console.log('? Módulo de estadísticas inicializado');
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /**
     * API global expuesta para debugging y control externo
     * Permite acceder a funciones principales y consultar estadísticas
     */
    window.statisticsModule = {
        reset: resetStatistics, // Función para resetear estadísticas
        pause: togglePause,   // Función para pausar/reanudar
        export: exportToCSV,   // Función para exportar a CSV
        getStats: () => ({    // Función para obtener estadísticas actuales
            totalDetections,
            avgConfidence: totalDetections > 0 ? confidenceSum / totalDetections : 0,
            gestureFrequency,
            currentStreak,
            maxStreak
        })
    };

})();
