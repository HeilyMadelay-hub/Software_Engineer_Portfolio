import { MediaPipeHandDetector } from "./modules/mediapipe-hands.js";
import { startSignalR } from "./modules/signalr-connection.js";

const video = document.getElementById("webcam-video");
const canvas = document.getElementById("tracking-canvas");

async function startWebcam() {
    try {
        // 🎯 Fuerza resolución EXACTA de 1280x720 (HD Ready)
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user",
                width: { exact: 1280 },
                height: { exact: 720 },
                frameRate: { ideal: 30 }
            }
        });

        video.srcObject = stream;

        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                const track = stream.getVideoTracks()[0];
                const settings = track.getSettings();
                console.log(`✅ Webcam: ${settings.width}x${settings.height} @ ${settings.frameRate}fps`);
                resolve();
            };
        });

    } catch (err) {
        console.error("❌ Error:", err);
        // Si falla con exact, intenta con ideal
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            video.srcObject = stream;
            await video.play();
            console.log("⚠️ Usando resolución fallback");
        } catch (err2) {
            alert("No se pudo acceder a la cámara");
        }
    }
}

async function init() {
    console.log("🚀 Iniciando...");

    await startSignalR();
    await startWebcam();

    const detector = new MediaPipeHandDetector(video, canvas);

    video.addEventListener('loadedmetadata', () => {
        detector.resizeCanvas();
    });

    window.addEventListener('resize', () => {
        detector.resizeCanvas();
    });

    window.addEventListener('beforeunload', () => {
        detector.destroy();
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(t => t.stop());
        }
    });

    console.log("✅ Listo");
}

init().catch(console.error);