import { MediaPipeHandDetector } from "./modules/mediapipe-hands.js";

const video = document.getElementById("webcam-video");
const canvas = document.getElementById("tracking-canvas");

const detector = new MediaPipeHandDetector(video, canvas);
await detector.initialize();

function loop() {
    const now = performance.now();
    const results = detector.detectHands(now);
    detector.drawLandmarks(results);
    requestAnimationFrame(loop);
}

loop();
