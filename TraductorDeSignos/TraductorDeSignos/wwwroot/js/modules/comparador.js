// NOTA: MediaPipe se carga globalmente via script tags en el HTML.

// Estado global
const state = {
    isActive: false,
    selectedGesture: null,
    referenceSignature: null,
    userLandmarks: null
};

// Canvas y contextos
let videoElement, userCanvas, userCtx, refCanvas, refCtx;
let hands, camera;

// Conexiones de la mano (MediaPipe)
const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],       // Pulgar
    [0, 5], [5, 6], [6, 7], [7, 8],       // Índice
    [0, 9], [9, 10], [10, 11], [11, 12],  // Medio
    [0, 13], [13, 14], [14, 15], [15, 16],// Anular
    [0, 17], [17, 18], [18, 19], [19, 20],// Meñique
    [5, 9], [9, 13], [13, 17]              // Palma
];

// inicializacion comparador

document.addEventListener('DOMContentLoaded', () => {
    console.log(' Inicializando Comparador de Gestos...');

    // Obtener elementos
    videoElement = document.getElementById('videoElement');
    userCanvas = document.getElementById('userCanvas');
    userCtx = userCanvas.getContext('2d');
    refCanvas = document.getElementById('referenceCanvas');
    refCtx = refCanvas.getContext('2d');

    // Configurar MediaPipe Hands
    initializeMediaPipe();

    // Configurar event listeners
    setupEventListeners();

    console.log('Comparador inicializado');
});

// inicializacion media pipe
function initializeMediaPipe() {
    // Usar el objeto global Hands que MediaPipe expone
    const Hands = window.Hands;

    // Verificar si MediaPipe Hands está disponible en el navegador
    if (!Hands) {
        console.error("MediaPipe Hands no está cargado. Asegúrate de incluir los scripts en el HTML.");
        return;
    }

    // Crear una nueva instancia del detector de manos de MediaPipe
    hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    // Configurar las opciones del detector de manos
    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
    });

    // Registrar la función callback que se ejecutará cada vez que se detecte una mano
    hands.onResults(onResults);

    // Obtener la clase Camera del objeto global window (utilidad de MediaPipe para cámara)
    const Camera = window.Camera;
    // Verificar si Camera Utils está disponible
    if (!Camera) {
        console.error("MediaPipe Camera Utils no está cargado. Asegúrate de incluir los scripts en el HTML.");
        return;
    }

    // Crear una nueva instancia de cámara vinculada al elemento de video
    camera = new Camera(videoElement, {
        // Función que se ejecuta en cada frame de la cámara (aprox. 30-60 veces por segundo)

        onFrame: async () => {
            // Solo procesar si el estado está activo (comparación en marcha) para enviar el frame actual del video al detector de manos para su análisis

            if (state.isActive) {
                await hands.send({ image: videoElement });
            }
        },
        width: 640, // Ancho del video en píxeles
        height: 480 // Alto del video en píxeles
    });

    console.log(' MediaPipe configurado');
}

function setupEventListeners() {

    // Botones de seleccionar gestos
    document.querySelectorAll('.gesture-btn').forEach(btn => {

        btn.addEventListener('click', async function () {
            // Desmarcar otros
            document.querySelectorAll('.gesture-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            state.selectedGesture = this.dataset.gesture;
            console.log(`Gesto seleccionado: ${state.selectedGesture}`);

            // Cargar firma de referencia
            await loadReferenceSignature(state.selectedGesture);

            // Actualizar UI
            document.getElementById('referenceGesture').textContent = state.selectedGesture.toUpperCase();
            document.getElementById('referencePlaceholder').style.display = 'none';
            document.getElementById('btnCapture').disabled = false;

            // Dibujar referencia
            if (state.referenceSignature) {
                drawReferenceGesture();
            }
        });
    });

    // Botón iniciar/pausar
    document.getElementById('btnToggleComparison').addEventListener('click', function () {
        state.isActive = !state.isActive;

        if (state.isActive) {
            this.innerHTML = '<i class="bi bi-pause-fill me-2"></i>Pausar';
            this.className = 'btn btn-warning btn-control';
            camera.start();
            updateConnectionStatus(true);
        } else {
            this.innerHTML = '<i class="bi bi-play-fill me-2"></i>Iniciar Comparación';
            this.className = 'btn btn-success btn-control';
            camera.stop();
            updateConnectionStatus(false);
        }
    });

    // Botón reset
    document.getElementById('btnReset').addEventListener('click', () => {
        location.reload();
    });

    // Botón capturar
    document.getElementById('btnCapture').addEventListener('click', () => {
        const dataURL = userCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `gesto_${state.selectedGesture}_${Date.now()}.png`;
        link.href = dataURL;
        link.click();
        console.log(' Frame capturado');
    });
}



/**
 * 
 * Carga el vector normalizado del gesto de referencia desde el servidor Cargar el gesto "ideal" o "plantilla" contra el cual se comparará
 * el gesto del usuario en tiempo real.Este vector ya viene prenormalizado del proceso de entrenamiento.
 * Frontend: Descarga JSON estático desde /gestures/{gesture}_firma.json (wwwroot/gestures)
 * Backend: GestureSignatureService carga los JSON en memoria al arrancar(uso interno)
 * 
 * Se usan archivos JSON estáticos en lugar de una API REST porque:
 * - Latencia prácticamente cero (cache del navegador)
 * - No hay lógica de negocio en tiempo real
 * - El gesto es inmutable tras el entrenamiento
 * - Menor complejidad en despliegue
 *
 * 1) Backend entrena gestos → genera firmas promedio
 * 2) Firmas se guardan como JSON en wwwroot/gestures
 * 3) Frontend descarga una firma al seleccionar gesto
 * 4) Firma se usa como referencia en compareGestures()
 * 5) Mano del usuario se normaliza y se compara en tiempo real
 * 
 * ESTA FUNCIÓN NO:
 * - No entrena modelos
 * - No normaliza vectores
 * - No valida el contenido matemáticamente
 * - No compara gestos
 * 
 */

async function loadReferenceSignature(gesture) {
    try {
        // Construir la URL del archivo JSON estático en wwwroot/gestures
        const response = await fetch(`/gestures/${gesture}_firma.json`);
        if (!response.ok) throw new Error('No encontrado');

        // Convertir el texto de respuesta a objeto JavaScript
        // El servidor debe servir el JSON con Content-Type: application/json del que cogemos solo la firma_promedio
        const data = await response.json();
        state.referenceSignature = data.firma_promedio;
        console.log(`? Firma cargada para '${gesture}': ${state.referenceSignature.length} valores`);
    } catch (error) {
        console.error('? Error cargando firma:', error);
        alert(`No se pudo cargar el gesto "${gesture}". Verifica que exista el archivo.`);

        // Limpiar la referencia para evitar comparaciones con datos corruptos
        // Esto hace que compareGestures() no se ejecute hasta que haya una firma válida
        // Previene errores en cascada si el JSON es inválido
        state.referenceSignature = null;
    }
}


/**
 * Callback ejecutado por MediaPipe en cada frame procesado
 * Recibe los resultados de detección y actualiza el canvas y la comparación
 * 
 * RESPONSABILIDADES:
 * 1. Dibujar el video con efecto espejo en el canvas
 * 2. Detectar si hay mano presente
 * 3. Dibujar los landmarks de la mano
 * 4. Comparar con el gesto de referencia si hay uno seleccionado
 * 5. Actualizar el estado de la interfaz
 */
function onResults(results) {

    if (!state.isActive) return; // Si la comparación está pausada, no procesar este frame

    // Ajustar canvas sincronizando el tamaño del canvas con el tamaño real del video
    userCanvas.width = videoElement.videoWidth || 640;
    userCanvas.height = videoElement.videoHeight || 480;

    // Borrar el frame anterior completamente antes de dibujar el nuevo
    userCtx.clearRect(0, 0, userCanvas.width, userCanvas.height);

    // Aplicar efecto espejo (voltear horizontalmente)
    userCtx.save();
    userCtx.scale(-1, 1);
    userCtx.translate(-userCanvas.width, 0);
    userCtx.drawImage(results.image, 0, 0, userCanvas.width, userCanvas.height);
    userCtx.restore();


    // Verificar si MediaPipe detectó al menos una mano en el frame
    // multiHandLandmarks es un array que puede contener 0, 1 o más manos
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {

        const landmarks = results.multiHandLandmarks[0];//Tomamos solo una mano porque todos los gestos son una mano

        state.userLandmarks = landmarks;// Guardar en el estado global para posible uso posterior

        // Invertir las coordenadas X de los landmarks para el efecto espejo
        const mirroredLandmarks = landmarks.map(lm => ({
            x: 1 - lm.x,
            y: lm.y,
            z: lm.z
        }));

        // Dibujar mano del usuario con landmarks invertidos
        drawHand(userCtx, mirroredLandmarks, userCanvas.width, userCanvas.height, '#00ff00', '#00cc00');

        // Solo comparar si:
        // 1. El usuario ha seleccionado un gesto (state.selectedGesture existe)
        // 2. La firma del gesto se ha cargado correctamente (state.referenceSignature existe)

        if (state.selectedGesture && state.referenceSignature) {
            //Usamos landmarks ORIGINALES (no invertidos) para comparación
            // La normalización elimina efectos de posición, así que no importa el espejo
            compareGestures(landmarks);
        }

        // Mostrar "Mano Detectada" con badge verde
        updateUserStatus(true);

    } else {

        // Mostrar "Sin Mano" con badge rojo
        updateUserStatus(false);
        // Resetear todos los indicadores de feedback a sus valores por defecto
        resetFeedback();
    }
}



// Dibujar mano
function drawHand(ctx, landmarks, width, height, lineColor, pointColor) {
    // Configuración de las líneas
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    //Dibujar conexiones
    HAND_CONNECTIONS.forEach(([start, end]) => {
        const p1 = landmarks[start];
        const p2 = landmarks[end];
        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.stroke();
    });

    // Puntos
    landmarks.forEach((lm, i) => {
        ctx.fillStyle = i === 0 ? '#ff0000' : pointColor;
        ctx.beginPath();
        ctx.arc(lm.x * width, lm.y * height, i === 0 ? 10 : 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

// Dibuja el gesto de referencia
function drawReferenceGesture() {

    if (!state.referenceSignature) return; // Si no existe una firma de referencia, no dibujamos nada

    // Tamaño fijo del canvas de referencia
    refCanvas.width = 640;
    refCanvas.height = 480;

    // Limpiar
    refCtx.fillStyle = '#16213e';
    refCtx.fillRect(0, 0, refCanvas.width, refCanvas.height);

    // Convertir firma a landmarks (x, y pares)
    const referenceLandmarks = [];
    for (let i = 0; i < state.referenceSignature.length; i += 2) {
        referenceLandmarks.push({
            x: state.referenceSignature[i],
            y: state.referenceSignature[i + 1]
        });
    }

    // Calcular bounds
    const xs = referenceLandmarks.map(lm => lm.x);
    const ys = referenceLandmarks.map(lm => lm.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);

    // Escalar y centrar para que el gesto no toque los bordes
    const padding = 80;
    const scaleX = (refCanvas.width - padding * 2) / (maxX - minX || 1);
    const scaleY = (refCanvas.height - padding * 2) / (maxY - minY || 1);
    const scale = Math.min(scaleX, scaleY);

    // Calculamos el desplazamiento para centrar el gesto
    const offsetX = (refCanvas.width - (maxX - minX) * scale) / 2;
    const offsetY = (refCanvas.height - (maxY - minY) * scale) / 2;


    // Ajustamos los puntos al canvas y los normalizamos (0–1)
    const normalizedLandmarks = referenceLandmarks.map(lm => ({
        x: ((lm.x - minX) * scale + offsetX) / refCanvas.width,
        y: ((lm.y - minY) * scale + offsetY) / refCanvas.height
    }));

    // Dibujar
    drawHand(refCtx, normalizedLandmarks, refCanvas.width, refCanvas.height, '#FFD700', '#FFA500');

    // Etiqueta del gesto
    refCtx.fillStyle = '#FFD700';
    refCtx.font = 'bold 24px Segoe UI';
    refCtx.textAlign = 'center';
    refCtx.fillText(`Gesto: ${state.selectedGesture.toUpperCase()}`, refCanvas.width / 2, 40);
}

/**
 * Compara el gesto del usuario con el gesto de referencia
 * Calcula la similitud mediante distancia euclidiana entre vectores normalizados
 * 
 * PROCESO:
 * 1. Convertir landmarks 3D a vector 2D [x1, y1, x2, y2, ...]
 * 2. Normalizar ambos vectores (usuario y referencia)
 * 3. Calcular distancia euclidiana entre vectores
 * 4. Convertir distancia a porcentaje de similitud (0-100%)
 * 5. Actualizar interfaz con feedback visual
 * 
 * userLandmarks - 21 landmarks de MediaPipe con {x, y, z}
 */
function compareGestures(userLandmarks) {
    // Convertir landmarks a vector
    const userVector = [];
    userLandmarks.forEach(lm => {
        userVector.push(lm.x, lm.y);
    });

    // Normalizar vector del usuario (igual que el backend)
    const normalizedUser = normalizeVector(userVector);
    const normalizedRef = normalizeVector(state.referenceSignature);

    // Calcular distancia euclidiana,mide qué tan "diferentes" son dos vectores
    // Fórmula: d = √[(a₁-b₁)² + (a₂-b₂)² + ... + (aₙ-bₙ)²]
    // Distancia = 0 → Vectores idénticos (gesto perfecto)
    // Distancia > 0 → Vectores diferentes (gesto con errores)
    let sum = 0;
    for (let i = 0; i < normalizedUser.length && i < normalizedRef.length; i++) {
        const diff = normalizedUser[i] - normalizedRef[i];
        sum += diff * diff;
    }
    const distance = Math.sqrt(sum); // Aplicar raíz cuadrada para obtener la distancia final

    // Calcular similitud (basado en umbral típico de 0.5)
    const threshold = 0.5;  // La distancia es inversamente proporcional a la similitud:
    const similarity = Math.max(0, Math.min(100, (1 - distance / threshold) * 100));  // similarity = (1 - distance/threshold) × 100

    // Enviar la similitud calculada a la función que actualiza todos los
    // elementos visuales
    updateFeedback(similarity, distance);
}



/**
 * Normaliza un vector para hacer comparaciones independientes de posición y escala
 * 
 * PROPÓSITO:
 * Permite comparar gestos sin que importen las características físicas del usuario
 * ni la posición de la mano en el frame. Solo importa la FORMA del gesto.
 * 
 * CASOS DE USO:
 * - Usuario 1: Manos grandes, cerca de la cámara
 * - Usuario 2: Manos pequeñas, lejos de la cámara
 * - Usuario 3: Mano en cualquier zona del frame
 * 
 * Sin normalizar: Necesitas MILES de ejemplos para cada caso
 * Con normalizar: UN SOLO ejemplo sirve para todos los casos
 */
function normalizeVector(vector) {

    //Paso 1
    // Calculamos la media del vector
    // 1) reduce suma todos los valores
    // 2) dividimos entre el número de elementos
    const mean = vector.reduce((a, b) => a + b, 0) / vector.length;

    //Paso 2
    // Centramos el vector
    // A cada valor le restamos la media
    // Esto elimina la influencia de la posición absoluta
    const centered = vector.map(v => v - mean);

    //Paso 3
    // Calculamos la norma (longitud del vector)
    // 1) elevamos cada valor al cuadrado
    // 2) sumamos todos los cuadrados
    // 3) sacamos la raíz cuadrada
    const norm = Math.sqrt(centered.reduce((sum, v) => sum + v * v, 0));

    //Paso 4
    // Evitamos división por cero
    // Si la norma es casi 0, no escalamos
    if (norm < 0.000001) return centered;

    //Paso 5
    // Normalizamos el vector
    // Dividimos cada componente entre la norma
    // Resultado: vector de longitud 1
    return centered.map(v => v / norm);
}

//Actualiza todos los elementos de feedback visual según la similitud calculada
//Controla: círculo de progreso, colores, emojis, badges, barras y sugerencias
function updateFeedback(similarity, distance) {
 
    const circumference = 283; // Constante que representa la circunferencia total del círculo SVG (2πr ≈ 283px)
    const offset = circumference - (similarity / 100) * circumference;   // Calcular el desplazamiento del trazo para crear efecto de progreso
    const circle = document.getElementById('similarityCircle'); // Constante que representa la circunferencia total del círculo SVG (2πr ≈ 283px) para aplicar el offset calculado para mostrar el progreso visualmente
    circle.style.strokeDashoffset = offset;
    document.getElementById('similarityPercent').textContent = Math.round(similarity) + '%';   // Actualizar el texto que muestra el porcentaje dentro del círculo

    // Color según similitud de umbral
    let color = '#dc3545';
    if (similarity >= 80) color = '#28a745';
    else if (similarity >= 60) color = '#ffc107';
    else if (similarity >= 40) color = '#fd7e14';
    circle.style.stroke = color;

    // Emoji y texto segun nivel de similitud
    let emoji, text;
    if (similarity >= 90) {
        emoji = '😃'; text = '¡Perfecto!';
    } else if (similarity >= 80) {
        emoji = '🙂'; text = '¡Excelente!';
    } else if (similarity >= 70) {
        emoji = '😌'; text = 'Muy bien';
    } else if (similarity >= 60) {
        emoji = '😅'; text = 'Casi perfecto';
    } else if (similarity >= 40) {
        emoji = '😐'; text = 'Sigue intentando';
    } else {
        emoji = '😢'; text = 'Intenta de nuevo';
    }

    document.getElementById('feedbackEmoji').textContent = emoji;
    document.getElementById('feedbackText').textContent = text;

    
    const devEl = document.getElementById('deviation'); // Obtener referencia al elemento que muestra la distancia euclidiana
    devEl.textContent = distance.toFixed(4); // Mostrar la distancia con 4 decimales de precisión
    devEl.className = `badge ${similarity >= 70 ? 'bg-success' : similarity >= 50 ? 'bg-warning' : 'bg-danger'}`; // Aplicar clase de Bootstrap según umbral de similitud

    // Barra de progreso de confianza confianza
    const confBar = document.getElementById('userConfidence');
    confBar.style.width = similarity + '%';
    confBar.textContent = Math.round(similarity) + '%';
    confBar.className = `progress-bar ${similarity >= 80 ? 'bg-success' : similarity >= 60 ? 'bg-warning' : 'bg-danger'}`;

    // Solo mostrar el nombre del gesto en mayúsculas si la similitud supera el umbral de 70% si no muestra ?
    if (similarity >= 70) {
        document.getElementById('userGesture').textContent = state.selectedGesture.toUpperCase();
        document.getElementById('userGesture').className = 'badge bg-success fs-6';
    } else {
        document.getElementById('userGesture').textContent = '?';
        document.getElementById('userGesture').className = 'badge bg-secondary fs-6';
    }

    //  Contenedor de la lista de diferencias/sugerencias
    const diffList = document.getElementById('differencesList');

    // Generar HTML de sugerencias según nivel de similitud
    if (similarity >= 90) {

        // Excelente (90-100%): Solo mensaje de felicitación
        diffList.innerHTML = '<div class="diff-item success"><i class="bi bi-check-circle me-2"></i>¡Gesto perfecto!</div>';

    } else if (similarity >= 70) {

        // Bueno (70-89%): Felicitación + pequeño aliento
        diffList.innerHTML = `
            <div class="diff-item success"><i class="bi bi-check-circle me-2"></i>Buen trabajo</div>
            <div class="diff-item"><i class="bi bi-arrow-up me-2"></i>Pequeños ajustes mejorarán la precision</div>
        `;
    } else {

        // Necesita mejora (0-69%): Sugerencias concretas de corrección
        diffList.innerHTML = `
            <div class="diff-item"><i class="bi bi-hand-index me-2"></i>Ajusta la posición de los dedos</div>
            <div class="diff-item"><i class="bi bi-arrows-angle-expand me-2"></i>Verifica la apertura de la mano</div>
            <div class="diff-item"><i class="bi bi-arrows-move me-2"></i>Centra la mano en la camara</div>
        `;
    }
}


// Actualiza el estado del usuario según si se detecta o no la mano
function updateUserStatus(detected) {
    // Obtiene el elemento HTML que muestra el estado del usuario
    const el = document.getElementById('userStatus');

    // Si se detecta una mano
    if (detected) {
        // Cambia el contenido HTML del elemento para mostrar "Mano Detectada" con un icono de check
        el.innerHTML = '<i class="bi bi-check-circle me-1"></i>Mano Detectada';

        // Cambia la clase del elemento para que tenga estilo de badge verde (éxito)
        el.className = 'status-badge badge bg-success';
    } else { // Si no se detecta ninguna mano
        // Cambia el contenido HTML para mostrar "Sin Mano" con un icono de X
        el.innerHTML = '<i class="bi bi-x-circle me-1"></i>Sin Mano';

        // Cambia la clase para que tenga estilo de badge rojo (error)
        el.className = 'status-badge badge bg-danger';
    }
}

// Actualiza el estado de la conexión (activo o inactivo)
function updateConnectionStatus(active) {
    // Obtiene el elemento HTML que muestra el estado de la conexión
    const el = document.getElementById('connectionStatus');

    // Si la conexión está activa
    if (active) {
        // Cambia el contenido HTML para mostrar "En Vivo" con un icono de transmisión
        el.innerHTML = '<i class="bi bi-broadcast me-1"></i>En Vivo';

        // Cambia la clase del elemento para mostrar un badge verde con padding
        el.className = 'badge bg-success px-3 py-2';
    } else { // Si la conexión está inactiva
        // Cambia el contenido HTML para mostrar "Desconectado" con un icono de círculo
        el.innerHTML = '<i class="bi bi-circle me-1"></i>Desconectado';

        // Cambia la clase del elemento para mostrar un badge gris con padding
        el.className = 'badge bg-secondary px-3 py-2';
    }
}


//Resetea todos los elementos de feedback a sus valores por defecto. Se llama cuando no hay mano detectada
function resetFeedback() {
    // Reinicia el círculo de similitud
    // strokeDashoffset es una propiedad de SVG que controla dónde empieza a dibujarse el trazo del borde
    // Al ponerlo en 283 (el perímetro del círculo), el trazo queda completamente vacío
    document.getElementById('similarityCircle').style.strokeDashoffset = 283;
    document.getElementById('similarityPercent').textContent = '0%';
    document.getElementById('userConfidence').style.width = '0%';
    document.getElementById('userConfidence').textContent = '0%';
}

/*
Mejoras que se podrían hacer:

•	loadReferenceSignature: falta validación del JSON, protección contra fetch colgado y escape del nombre del gesto.
•	Robustez UI: comprobar existence de elementos DOM antes de usarlos (evitar null refs).
•	Evitar alert en funciones de bajo nivel; devolver estado/errores y que la UI muestre mensajes.
•	Caché de firmas para evitar refetch repetido.
•	Evitar trabajo costoso en el bucle de frames (p. ej. throttling de compareGestures si es necesario).
•	Validar que state.referenceSignature.length sea par (x,y parejas) antes de usar.
•	Añadir JSDoc para parámetros/returns en funciones públicas.

*/