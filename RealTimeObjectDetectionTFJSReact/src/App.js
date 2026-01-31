// Import dependencies
import React, { useRef, useEffect, useState } from "react";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import "./App.css";
import { drawRect, drawFPS, drawObjectCount } from "./utilities";
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

function App() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [detectionCount, setDetectionCount] = useState(0);

    // Umbral de confianza mínimo (ajustable)
    const CONFIDENCE_THRESHOLD = 0.5; // 50% - puedes bajarlo a 0.3 si no detecta

    // Función principal
    const runCoco = async () => {
        try {
            await tf.ready();
            console.log('TensorFlow backend:', tf.getBackend());

            const net = await cocossd.load();
            console.log("COCO-SSD model loaded successfully");
            setIsModelLoaded(true);

            let lastDetectionTime = Date.now();
            let frameCount = 0;

            const detectLoop = () => {
                frameCount++;
                const now = Date.now();

                // Detectar cada ~100ms para no saturar
                if (now - lastDetectionTime >= 100) {
                    detect(net);
                    lastDetectionTime = now;
                }

                requestAnimationFrame(detectLoop);
            };

            detectLoop();

        } catch (error) {
            console.error(" Error loading model:", error);
        }
    };

    const detect = async (net) => {
        // Verificar que el video está listo
        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video &&
            webcamRef.current.video.readyState === 4
        ) {
            const video = webcamRef.current.video;
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;

            // Configurar dimensiones
            video.width = videoWidth;
            video.height = videoHeight;

            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;

            try {
                // Realizar detección
                const detections = await net.detect(video);

                // Filtrar por umbral de confianza
                const filteredDetections = detections.filter(
                    prediction => prediction.score >= CONFIDENCE_THRESHOLD
                );

                // Debug: mostrar detecciones en consola
                if (filteredDetections.length > 0) {
                    console.log(`Detected ${filteredDetections.length} objects:`,
                        filteredDetections.map(d => `${d.class} (${(d.score * 100).toFixed(1)}%)`).join(', ')
                    );
                }

                setDetectionCount(filteredDetections.length);

                // Dibujar en canvas
                const ctx = canvasRef.current.getContext("2d");
                ctx.clearRect(0, 0, videoWidth, videoHeight);

                // Dibujar detecciones
                drawRect(filteredDetections, ctx);
                drawFPS(ctx, videoWidth, videoHeight);
                drawObjectCount(filteredDetections, ctx, videoWidth);

            } catch (error) {
                console.error("Detection error:", error);
            }
        }
    };

    useEffect(() => {
        runCoco();

        // Cleanup al desmontar
        return () => {
            console.log("Component unmounted, stopping detection");
        };
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                {/* Indicador de estado del modelo */}
                <div style={{
                    position: 'absolute',
                    top: '80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: isModelLoaded ? 'rgba(0,255,0,0.2)' : 'rgba(255,255,0,0.2)',
                    padding: '10px 20px',
                    borderRadius: '20px',
                    zIndex: 10,
                    fontSize: '14px',
                    fontWeight: 'bold'
                }}>
                    {isModelLoaded ? ' Model Ready' : 'Loading Model...'}
                </div>

                <Webcam
                    ref={webcamRef}
                    muted={true}
                    mirrored={true}  
                    style={{
                        position: "absolute",
                        marginLeft: "auto",
                        marginRight: "auto",
                        left: 0,
                        right: 0,
                        textAlign: "center",
                        zIndex: 9,
                        width: 640,
                        height: 480,
                    }}

                />

                <canvas
                    ref={canvasRef}
                    style={{
                        position: "absolute",
                        marginLeft: "auto",
                        marginRight: "auto",
                        left: 0,
                        right: 0,
                        textAlign: "center",
                        zIndex: 10, // Canvas por encima del video
                        width: 640,
                        height: 480,
                    }}
                />
            </header>
        </div>
    );
}

export default App;