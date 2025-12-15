import { HandLandmarker, FilesetResolver } from
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],       // pulgar
    [0, 5], [5, 6], [6, 7], [7, 8],       // índice
    [0, 9], [9, 10], [10, 11], [11, 12],  // medio
    [0, 13], [13, 14], [14, 15], [15, 16],// anular
    [0, 17], [17, 18], [18, 19], [19, 20],// meñique
    [5, 9], [9, 13], [13, 17]             // palma
];


export class MediaPipeHandDetector {
    constructor(video, canvas) {
        this.video = video;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.handLandmarker = null;
        this.running = false;
        this.lastVideoTime = -1;

        this.filters = {};
    }

    async initialize() {
        await this.setupCamera();
        await this.loadMediaPipe();
        this.running = true;
    }

    async setupCamera() {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720, frameRate: 60 }
        });

        this.video.srcObject = stream;
        await this.video.play();

        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
    }

    async loadMediaPipe() {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );

        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 2,
            minHandDetectionConfidence: 0.7,
            minHandPresenceConfidence: 0.7,
            minTrackingConfidence: 0.7
        });
    }

    detectHands(timestamp) {
        if (!this.running) return null;

        if (this.video.currentTime === this.lastVideoTime) return null;
        this.lastVideoTime = this.video.currentTime;

        return this.handLandmarker.detectForVideo(this.video, timestamp);
    }

    applyFilters(landmarks, handId, timestamp) {
        if (!this.filters[handId]) {
            this.filters[handId] = landmarks.map(() => ({
                x: new OneEuroFilter(),
                y: new OneEuroFilter(),
                z: new OneEuroFilter()
            }));
        }

        return landmarks.map((p, i) => ({
            x: this.filters[handId][i].x.filter(p.x, timestamp),
            y: this.filters[handId][i].y.filter(p.y, timestamp),
            z: this.filters[handId][i].z.filter(p.z, timestamp)
        }));
    }

    drawLandmarks(results) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (!results?.landmarks) return;

        results.landmarks.forEach((landmarks) => {
            const pts = landmarks.map(p => ({
                x: p.x * this.canvas.width,
                y: p.y * this.canvas.height
            }));

            // 🟢 líneas
            this.ctx.strokeStyle = "#00FF00";
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = "round";

            HAND_CONNECTIONS.forEach(([a, b]) => {
                this.ctx.beginPath();
                this.ctx.moveTo(pts[a].x, pts[a].y);
                this.ctx.lineTo(pts[b].x, pts[b].y);
                this.ctx.stroke();
            });

            // 🔴 puntos
            this.ctx.fillStyle = "#FF0000";
            pts.forEach(p => {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
                this.ctx.fill();
            });
        });
    }



}
