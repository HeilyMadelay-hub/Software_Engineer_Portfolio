// STATISTICS DETECTOR MODULE
// Responsabilidad:
// 1. Configurar MediaPipe Hands para la página de estadísticas
// 2. Inicializar la cámara y el canvas
// 3. Enviar keypoints al backend vía SignalR

import { MediaPipeHandDetector } from './mediapipe-hands.js'; // Importar la clase principal del detector de manos

/**
 * Clase que gestiona el detector de manos específicamente para la página de estadísticas
 * 
 * Actúa como wrapper/adaptador entre MediaPipe y la interfaz de estadísticas.
 * 
 * ¿QUÉ ES UN WRAPPER?
 * Un wrapper (envoltorio) es una clase que envuelve otra clase compleja para simplificar su uso.
 * 
 * ¿POR QUÉ USAMOS UN WRAPPER AQUÍ?
 * MediaPipeHandDetector es complejo y requiere configuración específica. Este wrapper:
 * - Simplifica la inicialización (solo llamar a init())
 * - Maneja automáticamente la espera de SignalR
 * - Busca los elementos del DOM necesarios
 * - Proporciona una interfaz más simple (init/destroy)
 * - Encapsula la lógica específica de la página de estadísticas
 * 
 * USO:
 * const detector = new StatisticsDetector();
 * detector.init();  // Toda la complejidad está oculta aquí
 */
class StatisticsDetector {
    constructor() {
        this.detector = null; // Instancia del detector MediaPipe (null hasta que se inicialice)
        this.isInitialized = false; // Flag que indica si el detector está completamente inicializado y funcionando
    }

    async init() {
        // Obtener referencia al elemento de video donde se muestra la webcam y referencia al canvas donde se dibujan las detecciones y landmarks
        const videoElement = document.getElementById('webcam-video');
        const canvasElement = document.getElementById('tracking-canvas');

        if (!videoElement || !canvasElement) {
            console.error('StatisticsDetector: No se encontraron los elementos de video o canvas');
            return;
        }

        // Esperar a que SignalR esté conectado
        if (window.signalRManager) {
            this.initDetector(videoElement, canvasElement);
        } else {

            // Si no esta disponible esperar al evento de conexion cuando conecta
            window.addEventListener('signalrConnected', () => {
                this.initDetector(videoElement, canvasElement);
            });
        }
    }

    /**
     * Inicializa el detector MediaPipe con los elementos del DOM
     * Se ejecuta solo cuando SignalR está conectado
     */
    initDetector(videoElement, canvasElement) {
        try {
            this.detector = new MediaPipeHandDetector(videoElement, canvasElement);
            this.isInitialized = true;
            console.log('? StatisticsDetector: Inicializado correctamente');
        } catch (error) {
            console.error('? StatisticsDetector: Error al inicializar:', error);
        }
    }

    // Destruye el detector y libera recursos para evitar que se acumule basura en la ram hasta agotar recursos
    destroy() {
        if (this.detector) {
            this.detector.destroy();
            this.detector = null;
            this.isInitialized = false;
        }
    }
}

// Inicializar cuando el DOM esté listo

document.addEventListener('DOMContentLoaded', () => {
    const statisticsDetector = new StatisticsDetector();
    statisticsDetector.init();

    // Exponer la instancia globalmente para debugging desde la consola
    window.statisticsDetector = statisticsDetector;
});
