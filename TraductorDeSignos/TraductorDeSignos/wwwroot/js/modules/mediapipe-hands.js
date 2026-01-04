// Este archivo es la capa de detección de manos.
// Se encarga de:
// 1. Configurar y ejecutar MediaPipe Hands.
// 2. Dibujar los resultados (puntos, conexiones) en el canvas.
// 3. Enviar los keypoints al backend a través de SignalR.
//
// Es el primer archivo del flujo porque es el que genera los datos
// que consumen los demás.
//
// NOTA: MediaPipe se carga globalmente via script tags en el HTML.
// No usar imports ES6 porque la librería no los soporta.

export class MediaPipeHandDetector {

    // Recibe dependencias externas (inyección manual).
    constructor(videoElement, canvasElement) {
        //El this. guarda referencias al DOM 
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext("2d"); //ctx es el motor gráfico real.Representa la API que realmente sabe dibujar píxeles en pantalla.2d porque ya te da puntos en 2d haciendo el dibujo de manera inmediata

        //Flags de configuración para activar/desactivar funcionalidades sin tocar lógica.
        this.isDebugMode = false;
        this.showLabels = true;
        this.showConnections = true;

        //Metricas de estado para monitorizar
        this.lastGesture = "-";
        this.lastDistance = 0;
        this.lastFps = 0;
        this.lastLandmarkCount = 0;
        this.lastHandsCount = 0;
        this.lastLandmarks = null;

        //Base para calcular frames
        this.frameCount = 0;
        this.lastTime = performance.now();

        //Auto-inicialización al crear la instancia.
        this.init();
    }

    async init() {
        // Usar el objeto global Hands que MediaPipe expone
        const Hands = window.Hands;

        //MediaPipe expone Hands como global.
        if (!Hands) {
            console.error("MediaPipe Hands no está cargado. Asegúrate de incluir los scripts en el HTML.");
            return;
        }

        this.hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        //Configuracion del modelo
        this.hands.setOptions({
            maxNumHands: 2, // Detectar ambas manos para poder filtrar la izquierda
            modelComplexity: 1, //Balance de precisión y rendimiento
            //Reduce falsos positivos.
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
        });

        //Entra cada frame procesado
        this.hands.onResults((results) => this.onResults(results));

        // Usar el objeto global Camera
        const Camera = window.Camera;

        if (!Camera) {
            console.error("MediaPipe Camera Utils no está cargado. Asegúrate de incluir los scripts en el HTML.");
            return;
        }

        //vinculas la camara con el video
        this.camera = new Camera(this.video, {
            onFrame: async () => {
                await this.hands.send({ image: this.video });
            },
            width: 1280,
            height: 720,
        });


        //arranque completo del pipeline
        this.camera.start();
        this.resizeCanvas();
        this.startFpsCounter();
    }


    onResults(results) {
        //Dibuja el frame actual como fondo.
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);
        //Guarda cuántas manos detectó MediaPipe.
        this.lastHandsCount = results.multiHandLandmarks ? results.multiHandLandmarks.length : 0;

        // Filtrar solo la mano izquierda del usuario
        // Nota: La cámara está espejada, por lo que MediaPipe reporta "Right" 
        // para la mano izquierda física del usuario
        let leftHandLandmarks = null;
        if (results.multiHandLandmarks && results.multiHandedness) {
            for (let i = 0; i < results.multiHandedness.length; i++) {
                const handedness = results.multiHandedness[i];
                // MediaPipe reporta "Right" para la mano izquierda del usuario
                // debido al espejado de la cámara
                if (handedness.label === "Right") {
                    leftHandLandmarks = results.multiHandLandmarks[i];
                    break;
                }
            }
        }

        // Si MediaPipe ha detectado la mano izquierda del usuario
        if (leftHandLandmarks) {

            // Alias local para mejorar legibilidad (no modifica los datos)
            const landmarks = leftHandLandmarks;

            // Guardar el número de landmarks detectados (normalmente 21)
            // Se usa solo para métricas y debug
            this.lastLandmarkCount = landmarks.length;

            // Guardar la referencia al último frame válido
            // Permite mostrar datos y evitar usar valores antiguos
            this.lastLandmarks = landmarks;

            // Dibujar la mano detectada en el canvas
            // No altera los landmarks, solo visualiza
            this.draw(landmarks);

            // Convertir [{x,y,z}, ...] → [x1, y1, x2, y2, ...]
            // Formato óptimo para normalización y envío
            const keypoints = this.flattenLandmarks(landmarks);

            // Enviar los keypoints al backend en tiempo real
            // Se usa un manager global para desacoplar la comunicación
            if (window.signalRManager) {
                window.signalRManager.sendKeypoints(keypoints);
            } else {
                // Error de inicialización: el canal de comunicación no existe
                console.error("signalRManager no está disponible.");
            }

        } else {

            // No hay mano detectada: reflejar estado real
            this.lastLandmarkCount = 0;

            // Limpiar landmarks para evitar usar datos obsoletos
            this.lastLandmarks = null;
        }

        // Contar cada frame procesado (haya mano o no)
        // Se usa para calcular FPS reales
        this.frameCount++;

        // Actualizar métricas solo si el modo debug está activo
        // No afecta al flujo principal ni al rendimiento normal
        if (this.isDebugMode) {

            // Actualizar valores numéricos de debug (FPS, gesto, distancia, etc.)
            this.updateDebugMetrics();

            // Mostrar coordenadas crudas de cada landmark
            // Útil para inspección y calibración
            this.updateLandmarkData();
        }


       
    }

    draw(landmarks) {
        // Usar funciones globales de drawing_utils
        const drawConnectors = window.drawConnectors;
        const drawLandmarksFunc = window.drawLandmarks;
        const HAND_CONNECTIONS = window.HAND_CONNECTIONS;

        // Dibujar las conexiones entre landmarks si está habilitado
        // Se usa drawConnectors con color verde y grosor de línea 2
        if (this.showConnections && drawConnectors && HAND_CONNECTIONS) {
            drawConnectors(this.ctx, landmarks, HAND_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 2
            });
        }

        // Dibujar los puntos de cada landmark si la función está disponible
        // Color rojo, línea fina y radio 3 píxeles
        if (drawLandmarksFunc) {
            drawLandmarksFunc(this.ctx, landmarks, {
                color: '#FF0000',
                lineWidth: 1,
                radius: 3
            });
        }

        // Dibujar etiquetas si están habilitadas
        if (this.showLabels) {
            this.drawLabels(landmarks);
        }
    }

    drawLabels(landmarks) {

        // Lista de nombres de landmarks en orden según MediaPipe
        const labelNames = [
            'WRIST',
            'THUMB_CMC', 'THUMB_MCP', 'THUMB_IP', 'THUMB_TIP',
            'INDEX_MCP', 'INDEX_PIP', 'INDEX_DIP', 'INDEX_TIP',
            'MIDDLE_MCP', 'MIDDLE_PIP', 'MIDDLE_DIP', 'MIDDLE_TIP',
            'RING_MCP', 'RING_PIP', 'RING_DIP', 'RING_TIP',
            'PINKY_MCP', 'PINKY_PIP', 'PINKY_DIP', 'PINKY_TIP'
        ];

        // Configurar fuente y estilo del texto para las etiquetas
        this.ctx.font = '10px Arial';//Define la fuente del texto que se va a dibujar en el canvas
        this.ctx.fillStyle = '#FFFFFF';//Define el color de relleno del texto (blanco).
        this.ctx.strokeStyle = '#000000'; // Define el color del contorno (negro).Se usa para crear un borde alrededor del texto.
        this.ctx.lineWidth = 2; //Define el grosor del contorno del texto.

        // Iterar sobre cada landmark y dibujar su etiqueta
        landmarks.forEach((lm, i) => {
            const x = lm.x * this.canvas.width;// Coordenada X en pixels
            const y = lm.y * this.canvas.height;// Coordenada Y en pixels
            const label = labelNames[i] || i.toString(); // Nombre del landmark o índice si falta

            // Dibujar contorno negro detrás del texto para mejorar visibilidad
            this.ctx.strokeText(label, x + 5, y - 5);
            // Dibujar texto blanco encima del contorno
            this.ctx.fillText(label, x + 5, y - 5);
        });
    }

    //Ajusta el tamaño del <canvas> donde se dibujan los landmarks para que coincida con la resolución actual del video.
    //Garantiza que los puntos de la mano se dibujen correctamente y sin distorsión
    resizeCanvas() {
        // Comprobar si el video ya tiene dimensiones válidas
        if (this.video.videoWidth && this.video.videoHeight) {
            // Ajustar el canvas para que coincida exactamente con la resolución del video
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
        } else {
            // Si el video aún no tiene tamaño válido (por ejemplo, aún no carga)
            // establecer un tamaño por defecto para evitar errores al dibujar
            this.canvas.width = 1280;
            this.canvas.height = 720;
        }
    }

    startFpsCounter() {
        // Crear un contador de FPS que se actualiza cada segundo
        setInterval(() => {

            // Obtener el tiempo actual en milisegundos de alta precisión
            const now = performance.now();

            // Calcular el tiempo transcurrido desde la última medición
            const elapsed = now - this.lastTime;

            // Calcular FPS: número de frames procesados por segundo
            // frameCount * 1000 / elapsed → frames por segundo
            this.lastFps = Math.round((this.frameCount * 1000) / elapsed);

            // Reiniciar el contador de frames para el próximo intervalo
            this.frameCount = 0;

            // Guardar el tiempo actual como referencia para el siguiente cálculo
            this.lastTime = now;

        }, 1000); // Ejecutar cada 1000 ms = 1 segundo
    }

    flattenLandmarks(landmarks) {
        // Crear un array vacío para almacenar las coordenadas en formato plano
        const keypoints = [];

        // Iterar sobre cada landmark {x, y, z}
        for (const lm of landmarks) {

            // Añadir solo las coordenadas X e Y al array plano
            // Esto convierte [{x,y,z},...] → [x1,y1,x2,y2,...]
            keypoints.push(lm.x, lm.y);
        }

        // Devolver el array plano listo para normalización o envío al backend
        return keypoints;
    }


    updateDebugMetrics() {
        // Obtener referencias a los elementos HTML donde se mostrarán las métricas de debug
        const fpsEl = document.getElementById('debugFps');               // FPS (frames por segundo)
        const landmarkEl = document.getElementById('debugLandmarkCount'); // Número de landmarks detectados
        const handsEl = document.getElementById('debugHandsCount');       // Número de manos detectadas
        const gestureEl = document.getElementById('debugLastGesture');    // Último gesto detectado
        const confidenceEl = document.getElementById('debugConfidence');  // Confianza del gesto
        const distanceEl = document.getElementById('debugDistance');      // Distancia calculada para el gesto

        // Actualizar cada métrica si el elemento HTML existe
        if (fpsEl) fpsEl.textContent = this.lastFps;                       // FPS del loop de detección
        if (landmarkEl) landmarkEl.textContent = this.lastLandmarkCount;   // Mostrar número de landmarks
        if (handsEl) handsEl.textContent = this.lastHandsCount;            // Mostrar número de manos detectadas
        if (gestureEl) gestureEl.textContent = this.lastGesture;           // Mostrar nombre del último gesto

        // Calcular y mostrar la confianza del gesto basada en la distancia
        if (confidenceEl) {
            // Si la distancia es válida (entre 0 y 1)
            if (this.lastDistance > 0 && this.lastDistance < 1) {
                // Convertir distancia en porcentaje de confianza: 1 - distance → 0-100%
                const confidence = Math.max(0, Math.min(100, (1 - this.lastDistance) * 100));
                confidenceEl.textContent = confidence.toFixed(0) + '%'; // Mostrar como porcentaje entero
            } else {
                // Si no hay gesto válido, confianza = 0%
                confidenceEl.textContent = '0%';
            }
        }

        // Mostrar la distancia calculada con 4 decimales
        if (distanceEl) distanceEl.textContent = this.lastDistance.toFixed(4);
    }


    updateLandmarkData() {
        // Obtener el elemento HTML donde se mostrarán los datos de los landmarks
        const dataEl = document.getElementById('debugLandmarkData');

        // Si el elemento no existe en el DOM, salir de la función
        if (!dataEl) return;

        // Comprobar que haya landmarks detectados
        if (this.lastLandmarks && this.lastLandmarks.length > 0) {

            // Formatear cada landmark en una cadena legible
            // Incluye índice y coordenadas x, y, z con 3 decimales
            const formattedData = this.lastLandmarks.map((lm, i) => {
                return `[${i}] x:${lm.x.toFixed(3)} y:${lm.y.toFixed(3)} z:${lm.z.toFixed(3)}`;
            }).join('\n'); // Unir todas las líneas con salto de línea

            // Mostrar los datos formateados en el elemento HTML
            dataEl.textContent = formattedData;

        } else {
            // Si no hay landmarks detectados, mostrar mensaje por defecto
            dataEl.textContent = 'Sin mano detectada...';
        }
    }

    updateGestureMetrics(gestureName, distance) {
        // Guardar el nombre del último gesto detectado
        // Si gestureName es null o undefined, se usa "-" como valor por defecto
        this.lastGesture = gestureName || "-";

        // Guardar la distancia o similitud del gesto detectado
        // Si distance es null o undefined, se usa 0 como valor por defecto
        this.lastDistance = distance || 0;
    }

    setDebugMode(enabled) {
        // Activar o desactivar el modo debug según el parámetro
        this.isDebugMode = enabled;

        // Devolver el estado actual del modo debug
        return this.isDebugMode;
    }

    toggleDebugMode() {
        // Cambiar el estado del modo debug al contrario del actual
        this.isDebugMode = !this.isDebugMode;

        // Devolver el estado actualizado del modo debug
        return this.isDebugMode;
    }

    destroy() {
        // Si la cámara fue inicializada, detenerla
        // Esto libera recursos y detiene la captura de video
        if (this.camera) {
            this.camera.stop();
        }
    }

}
