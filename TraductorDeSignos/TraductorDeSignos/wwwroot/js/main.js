import { MediaPipeHandDetector } from "./modules/mediapipe-hands.js";

// ==================== ELEMENTOS DEL DOM ====================
// Elemento de video que muestra la webcam
const video = document.getElementById("webcam-video");
// Canvas donde se dibujan las detecciones y landmarks de las manos
const canvas = document.getElementById("tracking-canvas");

// ==================== VARIABLES GLOBALES DE SÍNTESIS DE VOZ ====================
// Almacena el utterance actual que se está reproduciendo
let currentUtterance = null;
// Voz seleccionada del sistema para la síntesis de voz
let selectedVoice = null;
// Flag que indica si las voces del sistema ya se cargaron
let voicesLoaded = false;
// Último texto que se reprodujo con TTS
let lastSpokenText = null;
// Timestamp de la última vez que se reprodujo un texto
let lastSpokenTime = 0;
// Tiempo mínimo en milisegundos entre reproducciones del mismo texto
const SPEAK_COOLDOWN = 700;

// ==================== DETECTOR DE MANOS ====================
// Variable global que contiene la instancia del detector MediaPipe
let detector = null;

// ==================== SISTEMA DE VOZ MEJORADO ====================

/**
 * Pre-carga y selecciona la mejor voz en español disponible del sistema
 * Retorna una promesa que se resuelve cuando las voces están listas
 */
function loadVoices() {
    return new Promise((resolve) => {
        // Intentar obtener las voces disponibles inmediatamente
        const voices = speechSynthesis.getVoices();

        if (voices.length > 0) {
            // Si ya hay voces disponibles, seleccionar la mejor
            selectBestSpanishVoice(voices);
            resolve();
        } else {
            // Si no hay voces aún, esperar al evento onvoiceschanged
            // Esto es necesario en Chrome/Edge donde las voces se cargan de forma asíncrona
            speechSynthesis.onvoiceschanged = () => {
                const voices = speechSynthesis.getVoices();
                selectBestSpanishVoice(voices);
                resolve();
            };
        }
    });
}

/**
 * Selecciona la mejor voz en español del sistema según prioridades
 * Prioridad 1: Español de España (es-ES) local
 * Prioridad 2: Cualquier voz en español local
 * Prioridad 3: Español de España online
 * Prioridad 4: Primera voz en español disponible
 */
function selectBestSpanishVoice(voices) {
    console.log(`Voces disponibles: ${voices.length}`);

    // Filtrar solo las voces que tienen idioma español (comienzan con 'es')
    const spanishVoices = voices.filter(v => v.lang.startsWith('es'));

    console.log(`Voces en español: ${spanishVoices.length}`);
    // Mostrar información detallada de cada voz en español
    spanishVoices.forEach(v => {
        console.log(`  - ${v.name} (${v.lang}) ${v.localService ? '[Local]' : '[Red]'}`);
    });

    // Si no hay voces en español, usar la voz predeterminada del sistema
    if (spanishVoices.length === 0) {
        console.warn("No hay voces en español, usando predeterminada");
        voicesLoaded = true;
        return;
    }

    // Prioridad 1: Buscar voz de España local (mejor calidad y sin latencia)
    selectedVoice = spanishVoices.find(v => v.lang === 'es-ES' && v.localService);

    // Prioridad 2: Si no hay de España local, buscar cualquier español local
    if (!selectedVoice) {
        selectedVoice = spanishVoices.find(v => v.localService);
    }

    // Prioridad 3: Si no hay locales, buscar de España online
    if (!selectedVoice) {
        selectedVoice = spanishVoices.find(v => v.lang === 'es-ES');
    }

    // Prioridad 4: Usar la primera voz en español disponible como último recurso
    if (!selectedVoice) {
        selectedVoice = spanishVoices[0];
    }

    console.log(`Voz seleccionada: ${selectedVoice.name} (${selectedVoice.lang})`);
    voicesLoaded = true;
}

// ==================== CONFIGURACIÓN DE WEBCAM ====================

/**
 * Inicia la webcam y configura el stream de video
 * Intenta primero con resolución exacta 1280x720, si falla usa resolución ideal
 */
async function startWebcam() {
    try {
        // Intentar obtener stream con resolución exacta
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user",         // Usar cámara frontal
                width: { exact: 1280 },      // Ancho exacto de 1280px
                height: { exact: 720 },      // Alto exacto de 720px
                frameRate: { ideal: 30 }     // Frame rate ideal de 30fps
            }
        });

        // Asignar el stream al elemento de video
        video.srcObject = stream;

        // Esperar a que los metadatos del video estén cargados
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();  // Iniciar reproducción del video
                // Obtener y mostrar la configuración real de la cámara
                const track = stream.getVideoTracks()[0];
                const settings = track.getSettings();
                console.log(`Webcam: ${settings.width}x${settings.height} @ ${settings.frameRate}fps`);
                resolve();
            };
        });

    } catch (err) {
        // Si falla con resolución exacta, intentar con resolución ideal (fallback)
        console.error("Error accediendo a webcam con resolución exacta:", err);
        try {
            // Intentar con parámetros más flexibles
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 1280 },      // Ideal en lugar de exact
                    height: { ideal: 720 },      // El navegador intentará acercarse
                    frameRate: { ideal: 30 }
                }
            });
            video.srcObject = stream;
            await video.play();
            console.log("Usando resolución fallback");
        } catch (err2) {
            // Error crítico: no se puede acceder a la cámara
            console.error("Error crítico con webcam:", err2);
            alert("No se pudo acceder a la cámara");
        }
    }
}

// ==================== DETECCIÓN DE GESTOS ====================

/**
 * Manejador del evento personalizado 'gestureDetected'
 * Se dispara cuando MediaPipe detecta un gesto reconocible
 * @param {CustomEvent} event - Evento con los detalles del gesto detectado
 */
function onGestureDetected(event) {
    // Extraer los datos del gesto del evento
    const result = event.detail;

    // Validar que el resultado tenga nombre de gesto
    if (!result || !result.gestureName) {
        console.warn("Gesto recibido sin nombre:", result);
        return;
    }

    // Mostrar información del gesto detectado con su confianza
    console.log(`Gesto detectado: ${result.gestureName} (confianza: ${(result.similarity * 100).toFixed(1)}%)`);

    // Obtener el elemento del DOM donde se mostrará el gesto
    const display = document.getElementById("gesture-display");
    if (!display) {
        console.error("Elemento 'gesture-display' no encontrado");
        return;
    }

    // Convertir el nombre del gesto a mayúsculas para mostrar
    const message = result.gestureName.toUpperCase();

    // Actualizar el contenido del display con el nuevo HTML
    const gestureText = display.querySelector('.gesture-text');
    if (gestureText) {
        // Si existe el elemento hijo .gesture-text, actualizar su contenido
        gestureText.textContent = message;
    } else {
        // Fallback: actualizar directamente el display si no existe la estructura
        display.textContent = message;
    }

    // Activar la clase CSS que hace visible el display
    display.classList.add("active");

    // Reproducir el nombre del gesto con síntesis de voz
    speakText(message, display);

    // Actualizar las métricas de debug del detector si está disponible
    if (detector) {
        detector.updateGestureMetrics(
            result.gestureName,
            result.distance || 0  // Distancia/confianza del gesto
        );
    }
}

// ==================== TEXT-TO-SPEECH MEJORADO ====================

/**
 * Función principal para reproducir texto con síntesis de voz
 * Implementa cooldown para evitar repeticiones rápidas del mismo texto
 * @param {string} text - Texto a reproducir
 * @param {HTMLElement} displayElement - Elemento del DOM para efectos visuales
 */
function speakText(text, displayElement) {
    // Verificar que el navegador soporte síntesis de voz
    if (!('speechSynthesis' in window)) return;

    // Si las voces aún no se han cargado, reintentar después de 100ms
    if (!voicesLoaded) {
        setTimeout(() => speakText(text, displayElement), 100);
        return;
    }

    const now = Date.now();

    // Prevenir repeticiones: si es el mismo texto y está en cooldown, no hacer nada
    if (text === lastSpokenText && now - lastSpokenTime < SPEAK_COOLDOWN) {
        return;
    }

    // Actualizar tracking del último texto reproducido
    lastSpokenText = text;
    lastSpokenTime = now;

    // Cancelar síntesis actual solo si es un texto diferente
    if (speechSynthesis.speaking || speechSynthesis.pending) {
        if (currentUtterance?.text !== text) {
            speechSynthesis.cancel();  // Cancelar la síntesis anterior
        } else {
            // Si ya se está reproduciendo este texto, no hacer nada
            return;
        }
    }

    // Proceder con la síntesis del nuevo texto
    actualSpeak(text, displayElement);
}

/**
 * Función que ejecuta la síntesis de voz con todos los parámetros configurados
 * @param {string} text - Texto a sintetizar
 * @param {HTMLElement} displayElement - Elemento para efectos visuales
 */
function actualSpeak(text, displayElement) {
    // Crear nuevo objeto de utterance (unidad de síntesis de voz)
    currentUtterance = new SpeechSynthesisUtterance(text);

    // Asignar la voz seleccionada si está disponible
    if (selectedVoice) {
        currentUtterance.voice = selectedVoice;
    }

    // Configuración optimizada para español
    currentUtterance.lang = 'es-ES';    // Idioma español de España
    currentUtterance.rate = 1.3;        // Velocidad (1.0 es normal, 1.3 es más rápido)
    currentUtterance.pitch = 1.1;       // Tono (1.0 es normal, 1.1 es ligeramente más alto)
    currentUtterance.volume = 1.0;      // Volumen (0.0 a 1.0)

    // Evento que se dispara cuando inicia la síntesis
    currentUtterance.onstart = () => {
        console.log(`Iniciando síntesis: "${text}"`);
        // Asegurar que el display esté visible
        displayElement.classList.add("active");
    };

    // Evento que se dispara cuando termina la síntesis
    currentUtterance.onend = () => {
        console.log(`Terminó de hablar: "${text}"`);

        // Mantener visible el display 500ms después de terminar
        setTimeout(() => {
            displayElement.classList.remove("active");
            currentUtterance = null;  // Limpiar referencia
        }, 500);
    };

    // Evento que se dispara si hay error en la síntesis
    currentUtterance.onerror = (event) => {
        console.error("Error en TTS:", event.error, event);

        // Si falla, mantener visible 1 segundo como fallback visual
        setTimeout(() => {
            displayElement.classList.remove("active");
            currentUtterance = null;
        }, 1000);
    };

    // Iniciar la síntesis de voz
    console.log(`Reproduciendo: "${text}"`);
    speechSynthesis.speak(currentUtterance);

    // Workaround para bug en Chrome/Edge donde a veces no inicia
    // Verificar después de 100ms si realmente está hablando
    setTimeout(() => {
        if (!speechSynthesis.speaking) {
            console.warn("Speech no se inició correctamente, reintentando...");
            speechSynthesis.cancel();
            speechSynthesis.speak(currentUtterance);
        }
    }, 100);
}

// ==================== CONTROLES DE DEBUG ====================

/**
 * Inicializa los controles de debug de la interfaz
 * Configura los event listeners para los botones de control
 */
function initDebugControls() {
    // Obtener referencias a los elementos de control
    const btnDebugMode = document.getElementById('btnDebugMode');
    const btnToggleLabels = document.getElementById('btnToggleLabels');
    const btnToggleLines = document.getElementById('btnToggleLines');
    const debugPanel = document.getElementById('debugPanel');

    // Verificar que el botón principal exista
    if (!btnDebugMode) {
        console.warn("Botón 'btnDebugMode' no encontrado");
        return;
    }

    // Verificar que el detector esté inicializado
    if (!detector) {
        console.error("Detector no inicializado, no se pueden configurar controles");
        return;
    }

    // ========== BOTÓN MODO DEBUG ==========
    // Activa/desactiva el modo debug completo
    btnDebugMode.addEventListener('click', () => {
        // Toggle del modo debug en el detector
        const isActive = detector.toggleDebugMode();

        // Actualizar el texto del botón según el estado
        const btnIcon = btnDebugMode.querySelector('i');
        const btnText = btnDebugMode.querySelector('span');

        if (btnText) {
            btnText.textContent = isActive ? 'Desactivar Debug' : 'Modo Debug';
        }

        // Actualizar clases CSS para estilo visual
        btnDebugMode.classList.toggle('active', isActive);

        // Mostrar u ocultar el panel de debug
        if (debugPanel) {
            debugPanel.style.display = isActive ? 'block' : 'none';
        }

        // Agregar clase al body para efectos visuales globales
        document.body.classList.toggle('debug-active', isActive);

        console.log(`Debug mode: ${isActive ? 'ACTIVADO' : 'DESACTIVADO'}`);
    });

    // ========== BOTÓN ETIQUETAS ==========
    // Activa/desactiva la visualización de etiquetas de landmarks
    if (btnToggleLabels) {
        btnToggleLabels.addEventListener('click', () => {
            // Toggle del flag de etiquetas en el detector
            detector.showLabels = !detector.showLabels;
            const isActive = detector.showLabels;

            // Actualizar clase CSS del botón
            btnToggleLabels.classList.toggle('active', isActive);

            console.log(`Etiquetas: ${isActive ? 'ON' : 'OFF'}`);
        });
    }

    // ========== BOTÓN CONEXIONES ==========
    // Activa/desactiva la visualización de líneas de conexión entre landmarks
    if (btnToggleLines) {
        btnToggleLines.addEventListener('click', () => {
            // Toggle del flag de conexiones en el detector
            detector.showConnections = !detector.showConnections;
            const isActive = detector.showConnections;

            // Actualizar clase CSS del botón
            btnToggleLines.classList.toggle('active', isActive);

            console.log(`Conexiones: ${isActive ? 'ON' : 'OFF'}`);
        });
    }

    console.log('Controles de debug inicializados correctamente');
}

// ==================== INICIALIZACIÓN ====================

/**
 * Función principal de inicialización del sistema
 * Ejecuta todos los pasos necesarios para arrancar la aplicación
 */
async function init() {
    console.log("Iniciando sistema de reconocimiento de gestos...");

    try {
        // 1. Cargar sistema de síntesis de voz
        console.log("Cargando voces del sistema...");
        await loadVoices();

        // 2. Iniciar la webcam
        console.log("Iniciando webcam...");
        await startWebcam();

        // 3. Configurar dimensiones del canvas según el video
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        console.log(`Canvas: ${canvas.width}x${canvas.height}`);

        // 4. Crear instancia del detector MediaPipe
        console.log("Iniciando MediaPipe...");
        detector = new MediaPipeHandDetector(video, canvas);

        // Hacer el detector accesible globalmente para debugging
        window.detector = detector;

        // 5. Registrar listener para el evento personalizado de gestos detectados
        window.addEventListener("gestureDetected", onGestureDetected);

        // 6. Configurar manejo de resize del video
        // Cuando los metadatos del video se cargan, ajustar el canvas
        video.addEventListener('loadedmetadata', () => {
            detector.resizeCanvas();
        });

        // Cuando la ventana cambia de tamaño, ajustar el canvas
        window.addEventListener('resize', () => {
            detector.resizeCanvas();
        });

        // 7. Inicializar los controles de debug
        initDebugControls();

        // 8. Configurar limpieza de recursos al cerrar la página
        window.addEventListener('beforeunload', () => {
            // Destruir el detector y liberar recursos de MediaPipe
            detector.destroy();
            // Detener todos los tracks del stream de video
            if (video.srcObject) {
                video.srcObject.getTracks().forEach(t => t.stop());
            }
            // Nota: La conexión SignalR se gestiona globalmente en otro módulo
        });

        console.log("Sistema completamente listo");

    } catch (err) {
        // Capturar y mostrar cualquier error durante la inicialización
        console.error("Error en inicialización:", err);
        alert(`Error al inicializar: ${err.message}`);
    }
}

// ==================== ARRANQUE DEL SISTEMA ====================

// Flag para prevenir múltiples inicializaciones
let initStarted = false;

/**
 * Función segura de inicialización que previene múltiples ejecuciones
 */
function safeInit() {
    // Si ya se inició, no hacer nada
    if (initStarted) return;
    initStarted = true;

    // Ejecutar inicialización y capturar errores fatales
    init().catch(err => {
        console.error("Error fatal al inicializar:", err);
        alert("Error al inicializar el sistema. Revisa la consola.");
    });
}

// Esperar a que SignalR esté conectado antes de iniciar
// Este evento es disparado por el módulo de SignalR cuando conecta
window.addEventListener('signalrConnected', () => {
    console.log("SignalR listo, iniciando el resto de la aplicación.");
    safeInit();
});

// Fallback: si SignalR no conecta en 5 segundos, iniciar de todos modos
// Esto permite que la aplicación funcione incluso si SignalR falla
setTimeout(() => {
    if (!initStarted) {
        console.warn("SignalR no conectó a tiempo, iniciando sin él...");
        safeInit();
    }
}, 5000);

// También intentar iniciar cuando el DOM esté listo
// Por si SignalR ya conectó antes de que este script se ejecutara
document.addEventListener('DOMContentLoaded', () => {
    // Dar un pequeño delay para que SignalR tenga oportunidad de conectar
    setTimeout(() => {
        if (!initStarted && window.signalRManager) {
            console.log("DOM listo y SignalR disponible, iniciando...");
            safeInit();
        }
    }, 1000);
});