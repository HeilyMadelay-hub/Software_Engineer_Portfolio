// ==================== MEDIAPIPE HAND DETECTOR (ULTRA RESPONSIVO) ====================
import { HandLandmarker, FilesetResolver } from
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
import { sendKeypoints } from "./signalr-connection.js";

// ================= KALMAN =================
class Kalman1D {
    constructor(R = 0.001, Q = 0.01) {
        this.R = R;
        this.Q = Q;
        this.x = NaN;
        this.cov = NaN;
    }

    filter(z) {
        if (isNaN(this.x)) {
            this.x = z;
            this.cov = 1;
            return z;
        }
        const predX = this.x;
        const predCov = this.cov + this.Q;
        const K = predCov / (predCov + this.R);
        this.x = predX + K * (z - predX);
        this.cov = (1 - K) * predCov;
        return this.x;
    }
}

// ================= HAND DETECTOR =================
export class MediaPipeHandDetector {
    constructor(video, canvas) {
        this.video = video;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d", {
            alpha: true,
            desynchronized: true,
            willReadFrequently: false
        });

        // ⚡ CONFIGURACIÓN ULTRA RESPONSIVA
        this.BUFFER_SIZE = 1;           
        this.MAX_DROP_FRAMES = 2;     
        this.ID_DIST_THRESHOLD = 0.15;

        this.landmarker = null;
        this.lastProcessedTime = -1;
        this.animationId = null;

        this.handCenters = {};
        this.buffers = {};
        this.kalmans = {};
        this.confidenceDrop = {};
        this.lastValidHands = {};
        this.lastKeypoints = [];

        this.targetFPS = 30;
        this.frameInterval = 1000 / this.targetFPS;
        this.lastRenderTime = 0;

        // ✨ Canvas offscreen para doble buffer
        this.offscreenCanvas = null;
        this.offscreenCtx = null;

        this.init();
    }

    async init() {
        const filesetResolver = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );

        this.landmarker = await HandLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                delegate: "GPU"
            },
            numHands: 2,
            runningMode: "VIDEO",
            minHandDetectionConfidence: 0.6,    // ⬆️ Más estricto
            minHandPresenceConfidence: 0.6,     // ⬆️ Más estricto
            minTrackingConfidence: 0.6          // ⬆️ Más estricto
        });

        console.log("✅ MediaPipe Hand Landmarker inicializado");
        this.startMainLoop();
    }

    startMainLoop() {
        const loop = (timestamp) => {
            const elapsed = timestamp - this.lastRenderTime;
            if (elapsed < this.frameInterval) {
                this.animationId = requestAnimationFrame(loop);
                return;
            }

            this.lastRenderTime = timestamp;

            // Procesa detección
            if (this.video.readyState >= this.video.HAVE_CURRENT_DATA && this.landmarker) {
                if (this.video.currentTime !== this.lastProcessedTime) {
                    this.lastProcessedTime = this.video.currentTime;
                    const timestampMs = Math.floor(this.video.currentTime * 1000);

                    try {
                        const results = this.landmarker.detectForVideo(this.video, timestampMs);
                        this.processResults(results);
                    } catch (e) {
                        console.warn("⚠️ Error en detección MediaPipe:", e);
                    }
                }
            }

            // Renderiza
            this.render();

            this.animationId = requestAnimationFrame(loop);
        };

        this.animationId = requestAnimationFrame(loop);
    }

    // ---------- RENDER COMPLETO (VIDEO + LANDMARKS) ----------
    render() {
        if (this.video.readyState < this.video.HAVE_CURRENT_DATA) return;

        // Crea offscreen canvas si no existe
        if (!this.offscreenCanvas) {
            this.offscreenCanvas = document.createElement('canvas');
            this.offscreenCanvas.width = this.canvas.width;
            this.offscreenCanvas.height = this.canvas.height;
            this.offscreenCtx = this.offscreenCanvas.getContext('2d', {
                alpha: false,
                desynchronized: true
            });
        }

        // 1️⃣ Dibuja video en offscreen
        this.offscreenCtx.drawImage(
            this.video,
            0, 0,
            this.offscreenCanvas.width,
            this.offscreenCanvas.height
        );

        // 2️⃣ Dibuja landmarks en offscreen (solo si hay manos detectadas)
        if (Object.keys(this.lastValidHands).length > 0) {
            this.offscreenCtx.strokeStyle = "#00FF00";
            this.offscreenCtx.fillStyle = "#FF0000";
            this.offscreenCtx.lineWidth = 2;
            this.offscreenCtx.lineCap = "round";
            this.offscreenCtx.lineJoin = "round";

            for (const id in this.lastValidHands) {
                this.drawHandToContext(this.lastValidHands[id], this.offscreenCtx);
            }
        }

        // 3️⃣ Copia TODO de una vez al canvas visible
        this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    }

    drawHandToContext(smooth, ctx) {
        const pts = smooth.map(p => ({
            x: p.x * this.offscreenCanvas.width,
            y: p.y * this.offscreenCanvas.height
        }));

        const fingers = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [0, 9], [9, 10], [10, 11], [11, 12],
            [0, 13], [13, 14], [14, 15], [15, 16],
            [0, 17], [17, 18], [18, 19], [19, 20],
            [5, 9], [9, 13], [13, 17]
        ];

        // Dibuja líneas
        ctx.beginPath();
        for (const [a, b] of fingers) {
            if (!pts[a] || !pts[b]) continue;
            ctx.moveTo(pts[a].x, pts[a].y);
            ctx.lineTo(pts[b].x, pts[b].y);
        }
        ctx.stroke();

        // Dibuja puntos
        for (const p of pts) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ---------- UTILIDADES DE ID Y FILTRADO ----------
    getCenter(landmarks) {
        let x = 0, y = 0;
        for (const p of landmarks) { x += p.x; y += p.y; }
        return { x: x / landmarks.length, y: y / landmarks.length };
    }

    matchHandId(landmarks) {
        const c = this.getCenter(landmarks);
        let bestId = null;
        let bestDist = this.ID_DIST_THRESHOLD;
        for (const id in this.handCenters) {
            const p = this.handCenters[id];
            const d = Math.hypot(c.x - p.x, c.y - p.y);
            if (d < bestDist) {
                bestDist = d;
                bestId = id;
            }
        }
        if (!bestId) bestId = crypto.randomUUID();
        this.handCenters[bestId] = c;
        return bestId;
    }

    applyKalman(landmarks, id) {
        this.kalmans[id] ??= landmarks.map(() => ({
            x: new Kalman1D(0.001, 0.001),  // ⚡ ULTRA responsivo
            y: new Kalman1D(0.001, 0.001),
            z: new Kalman1D(0.001, 0.001)
        }));
        return landmarks.map((p, i) => {
            const f = this.kalmans[id][i];
            return {
                x: f.x.filter(p.x),
                y: f.y.filter(p.y),
                z: f.z.filter(p.z)
            };
        });
    }

    applyBuffer(landmarks, id) {
        // ⚡ BUFFER = 1 → Sin promediado, retorna directamente
        if (this.BUFFER_SIZE === 1) {
            return landmarks;
        }

        this.buffers[id] ??= [];
        this.buffers[id].push(landmarks.map(p => ({ ...p })));
        if (this.buffers[id].length > this.BUFFER_SIZE) this.buffers[id].shift();

        const frames = this.buffers[id];
        return landmarks.map((_, i) => {
            let x = 0, y = 0, z = 0;
            for (const f of frames) {
                x += f[i].x;
                y += f[i].y;
                z += f[i].z;
            }
            const count = frames.length;
            return { x: x / count, y: y / count, z: z / count };
        });
    }

    // ---------- PROCESAMIENTO ----------
    processResults(results) {
        const active = new Set();
        const keypoints = [];

        if (results?.landmarks?.length) {
            results.landmarks.forEach((lm, i) => {
                const confidence = results.handednesses?.[i]?.[0]?.score ?? 1;
                if (confidence < 0.6) return;

                const id = this.matchHandId(lm);
                active.add(id);
                this.confidenceDrop[id] = 0;

                const kalman = this.applyKalman(lm, id);
                const smooth = this.applyBuffer(kalman, id);

                this.lastValidHands[id] = smooth;
                smooth.forEach(p => keypoints.push(p.x, p.y, 0));
            });
        }

        // ⚡ LIMPIEZA INSTANTÁNEA - Borra landmarks inmediatamente
        const handsToDelete = [];
        for (const id in this.handCenters) {
            if (!active.has(id)) {
                this.confidenceDrop[id] = (this.confidenceDrop[id] || 0) + 1;
                if (this.confidenceDrop[id] > this.MAX_DROP_FRAMES) {
                    handsToDelete.push(id);
                }
            }
        }

        // Borra todas las manos perdidas de una vez
        for (const id of handsToDelete) {
            delete this.handCenters[id];
            delete this.buffers[id];
            delete this.kalmans[id];
            delete this.confidenceDrop[id];
            delete this.lastValidHands[id];
        }

        // Envío de keypoints
        if (keypoints.length === 63 || keypoints.length === 126) {
            this.lastKeypoints = keypoints;
            try {
                sendKeypoints(keypoints);
            } catch (e) {
                console.warn("⚠️ Error enviando keypoints:", e);
            }
        }
    }

    resizeCanvas() {
        if (!this.canvas || !this.video) return;

        let width = this.video.videoWidth;
        let height = this.video.videoHeight;

        if (width === 0 || height === 0) {
            width = 1280;
            height = 720;
        }

        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;

            if (this.offscreenCanvas) {
                this.offscreenCanvas.width = width;
                this.offscreenCanvas.height = height;
            }

            console.log(`✅ Canvas: ${width}x${height}`);
        }
    }

    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.landmarker) this.landmarker.close();
    }
}