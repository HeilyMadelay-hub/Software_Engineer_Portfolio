\# Real-Time Object Detection with TensorFlow.js



\## 📝 Project Overview



This project implements a \*\*real-time object detection system\*\* using a browser webcam. Originally created as a TensorFlow.js demo, it leverages the \*\*COCO-SSD pre-trained model\*\* to identify everyday objects in video frames.



---



\## 🔍 Code Analysis



\### Current Project Status



The code is \*\*functional\*\* but has some inconsistencies and areas for improvement.



\*\*✅ Strengths:\*\*



\* Correct basic implementation of COCO-SSD

\* Functional React integration with TensorFlow.js

\* Well-structured video capture and canvas rendering



\*\*⚠️ Issues Identified:\*\*



1\. \*\*Typo in logging\*\*



```javascript

console.log("Handpose model loaded."); // ❌ Misleading message; should reference COCO-SSD

```



2\. \*\*Performance issues\*\*



\* Detection runs every 10ms (~100 fps) → CPU overload

\* Canvas is not cleared between frames → visual artifacts



3\. \*\*Memory leak\*\*



\* `setInterval` not cleaned up on component unmount



```javascript

useEffect(() => { runCoco() }, \[]);

// ❌ Missing cleanup function to clear interval

```



4\. \*\*CSS styling\*\*



```javascript

zindex: 9; // ❌ Should be `zIndex` in React (camelCase)

```



5\. \*\*Random colors\*\*



\* Colors generated dynamically may be too light or hard to read

\* No consistency between detections of the same object class



---



\## 🛠️ Technology Stack



\### Frontend



\* \*\*React\*\* 16.13.1 (primary framework)

\* \*\*React Webcam\*\* 5.2.0 (camera capture)



\### Machine Learning



\* \*\*TensorFlow.js\*\* 2.4.0 (in-browser ML runtime)

\* \*\*COCO-SSD\*\* 2.1.0 (pre-trained object detection model)



&nbsp; \* Detects 80 object classes (people, vehicles, animals, furniture, etc.)

&nbsp; \* Based on COCO (Common Objects in Context) dataset

&nbsp; \* Optimized for browser execution



\### Development Tools



\* \*\*Create React App\*\* 3.4.3

\* \*\*Yarn\*\* (preferred over npm)



---



\## 🎯 How the Code Works



\### Architecture Overview



```

┌─────────────┐

│   Webcam    │ ← Captures real-time video

└──────┬──────┘

&nbsp;      │

&nbsp;      ▼

┌─────────────────┐

│  COCO-SSD Model │ ← Object detection every 10ms

└──────┬──────────┘

&nbsp;      │

&nbsp;      ▼

┌─────────────────┐

│ Canvas Overlay  │ ← Draws bounding boxes

└─────────────────┘

```



\### Key Components



\#### 1. \*\*App.js\*\* – Main Component



```javascript

const webcamRef = useRef(null);

const canvasRef = useRef(null);



const runCoco = async () => {

&nbsp; const net = await cocossd.load();

&nbsp; setInterval(() => detect(net), 10); // Detection loop

};

```



\#### 2. \*\*detect()\*\* – Detection Engine



```javascript

const detect = async (net) => {

&nbsp; if (webcamRef.current?.video.readyState === 4) {

&nbsp;   const video = webcamRef.current.video;

&nbsp;   const videoWidth = video.videoWidth;

&nbsp;   const videoHeight = video.videoHeight;



&nbsp;   canvasRef.current.width = videoWidth;

&nbsp;   canvasRef.current.height = videoHeight;



&nbsp;   const objects = await net.detect(video);



&nbsp;   const ctx = canvasRef.current.getContext("2d");

&nbsp;   drawRect(objects, ctx);

&nbsp; }

};

```



\#### 3. \*\*utilities.js\*\* – Drawing Utility



```javascript

export const drawRect = (detections, ctx) => {

&nbsp; detections.forEach(prediction => {

&nbsp;   const \[x, y, width, height] = prediction\['bbox'];

&nbsp;   const text = prediction\['class'];



&nbsp;   const color = Math.floor(Math.random() \* 16777215).toString(16);



&nbsp;   ctx.strokeStyle = '#' + color;

&nbsp;   ctx.fillStyle = '#' + color;

&nbsp;   ctx.font = '18px Arial';

&nbsp;   ctx.fillText(text, x, y);

&nbsp;   ctx.rect(x, y, width, height);

&nbsp;   ctx.stroke();

&nbsp; });

};

```



\### Execution Flow



1\. Component mounts → `useEffect` calls `runCoco()`

2\. COCO-SSD model loads asynchronously

3\. Detection loop runs via `setInterval` (every 10ms)

4\. Model analyzes the current video frame

5\. Bounding boxes are rendered on canvas

6\. Process repeats continuously



\### Detectable Objects (COCO 80 Classes)



\* \*\*People:\*\* person

\* \*\*Vehicles:\*\* car, truck, bus, motorcycle, bicycle, airplane, train, boat

\* \*\*Animals:\*\* cat, dog, horse, sheep, cow, elephant, bear, zebra, giraffe

\* \*\*Everyday Objects:\*\* bottle, cup, fork, knife, spoon, bowl, chair, couch, tv, laptop, mouse, keyboard, cell phone, book

\* And many more…



---



\## ⚙️ Known Issues \& Setup Instructions



\### 1. `babel-jest` dependency conflicts



\* Older React Scripts require `babel-jest@24.x`, but Node may have `v29.x`.

\* \*\*Solution:\*\* Remove `node\_modules`, `package-lock.json`, `yarn.lock` and reinstall with Yarn.



\### 2. PowerShell usage on Windows



\* CMD commands like `rmdir /s /q node\_modules` may fail.



```powershell

Remove-Item -Recurse -Force node\_modules

```



\### 3. Node ≥17 OpenSSL error: `ERR\_OSSL\_EVP\_UNSUPPORTED`



\* Recommended: use Node v16 (LTS) with \[nvm-windows](https://github.com/coreybutler/nvm-windows)



```powershell

nvm install 16

nvm use 16

```



\* Quick alternative:



```powershell

$env:NODE\_OPTIONS="--openssl-legacy-provider"

yarn start

```



\### 4. Final Installation \& Run



```powershell

Remove-Item -Recurse -Force node\_modules

Remove-Item -Force package-lock.json

Remove-Item -Force yarn.lock



yarn install

yarn start

```



Access the app at `http://localhost:3000` to test real-time object detection.



---



\## 📜 Available Scripts



\* `yarn start` → Development mode with live reload

\* `yarn build` → Production-ready build in `build/`

\* `yarn test` → Interactive test runner

\* `yarn eject` → Exposes Webpack/Babel/ESLint config (irreversible)



---



\## 🚀 Recommended Improvements



\* Add camera selection (front/back)

\* Screenshot capture with overlays

\* Object detection history logging

\* Export detection statistics (CSV/JSON)

\* Dark/light mode support

\* Class-specific filters in UI

\* Video recording with annotations

\* Multi-language support

\* PWA for mobile installation



---



\## 📄 License



MIT License





