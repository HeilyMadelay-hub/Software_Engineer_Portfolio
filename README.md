# Real-Time Object Detection with TensorFlow.js

> **Demo project for a talk on “Artificial Intelligence on the Web with React and TensorFlow.js”**
> This demo demonstrates real-time object detection in the browser using a webcam.
> You can access the accompanying article here: [Medium Article](https://medium.com/@madcodlife)

---

## 📝 Project Overview

This project implements a **real-time object detection system** in the browser using TensorFlow.js and the pre-trained COCO-SSD model. Originally created several years ago as a demo, it identifies everyday objects through the webcam.

The demo showcases the ability to run machine learning entirely client-side and illustrates best practices for integrating ML models with React applications.

---

## 🔍 Code Analysis

### Project Status

The project is **functional**, but there were some inconsistencies and areas for improvement:

**✅ Strengths**

* Correct basic implementation of COCO-SSD
* Functional integration of React with TensorFlow.js
* Well-structured video capture and canvas rendering

**⚠️ Issues Identified**

1. **Typographical errors**

```javascript
console.log("Handpose model loaded."); // ❌ Incorrect label, COCO-SSD is loaded
```

2. **Performance concerns**

* Detection every 10ms (~100 FPS) → too fast, can overload CPU
* Canvas not cleared between frames → bounding boxes accumulate visually

3. **Memory leak**

```javascript
useEffect(() => { runCoco() }, []);
// ❌ No cleanup function to clear interval
```

4. **CSS style issues**

```javascript
zindex: 9; // ❌ Should be zIndex (React camelCase)
```

5. **Random colors**

* Generated colors may be too light or inconsistent
* No visual consistency for the same object class

---

## 🛠️ Technologies

### Frontend

* **React** 16.13.1 – main framework
* **React Webcam** 5.2.0 – camera video capture

### Machine Learning

* **TensorFlow.js** 2.4.0 – client-side ML runtime
* **COCO-SSD** 2.1.0 – pre-trained object detection model

  * Detects **80 object classes** (people, vehicles, animals, furniture, etc.)
  * Based on the **COCO dataset** (Common Objects in Context)
  * Optimized for browser execution

### Development Tools

* **Create React App** 3.4.3 – project scaffolding
* **Yarn** – preferred package manager for this project

---

## 🎯 Code Architecture

```
┌─────────────┐
│   Webcam    │ ← Captures real-time video
└──────┬──────┘
       ▼
┌─────────────────┐
│  COCO-SSD Model │ ← Detects objects every 10ms
└──────┬──────────┘
       ▼
┌─────────────────┐
│ Canvas Overlay  │ ← Draws bounding boxes
└─────────────────┘
```

### Main Components

#### **App.js**

```javascript
const webcamRef = useRef(null);
const canvasRef = useRef(null);

const runCoco = async () => {
  const net = await cocossd.load();
  setInterval(() => detect(net), 10); // Detection loop
};
```

#### **detect()** – Detection Engine

```javascript
const detect = async (net) => {
  if (webcamRef.current?.video.readyState === 4) {
    const video = webcamRef.current.video;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const obj = await net.detect(video);

    const ctx = canvasRef.current.getContext("2d");
    drawRect(obj, ctx);
  }
};
```

#### **utilities.js** – Drawing Function

```javascript
export const drawRect = (detections, ctx) => {
  detections.forEach(prediction => {
    const [x, y, width, height] = prediction['bbox'];
    const text = prediction['class'];

    const color = Math.floor(Math.random()*16777215).toString(16);

    ctx.strokeStyle = '#' + color;
    ctx.fillStyle = '#' + color;
    ctx.font = '18px Arial';
    ctx.fillText(text, x, y);
    ctx.rect(x, y, width, height);
    ctx.stroke();
  });
};
```

### Execution Flow

1. **Mount:** `App` component mounts
2. **Load:** `useEffect` calls `runCoco()` to load COCO-SSD
3. **Loop:** `setInterval` triggers `detect()` every 10ms
4. **Detection:** The model analyzes the current video frame
5. **Render:** Bounding boxes drawn on canvas
6. **Repeat:** Continuous detection cycle

### Detectable Objects (80 COCO Classes)

* **People:** person
* **Vehicles:** car, truck, bus, motorcycle, bicycle, airplane, train, boat
* **Animals:** cat, dog, horse, sheep, cow, elephant, bear, zebra, giraffe
* **Everyday objects:** bottle, cup, fork, knife, spoon, bowl, chair, couch, tv, laptop, mouse, keyboard, cell phone, book
* And many more…

---

## ⚙️ Running the Project

### 1. **Babel-jest dependency conflict**

* Older React Scripts require `babel-jest` v24.x; modern Node may have v29.x
* **Solution:** Remove `node_modules`, `package-lock.json`, `yarn.lock` and reinstall with Yarn

### 2. **Windows PowerShell**

```powershell
Remove-Item -Recurse -Force node_modules
```

### 3. **ERR_OSSL_EVP_UNSUPPORTED**

* Node ≥17 may trigger OpenSSL errors
* **Recommended:** Use Node v16 LTS with [nvm-windows](https://github.com/coreybutler/nvm-windows)

```powershell
nvm install 16
nvm use 16
```

* **Alternative:** Set legacy OpenSSL provider temporarily

```powershell
$env:NODE_OPTIONS="--openssl-legacy-provider"
yarn start
```

### 4. **Final Installation**

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
Remove-Item -Force yarn.lock

yarn install
yarn start
```

The app will run on `http://localhost:3000`, with real-time object detection through your webcam.

---

## 📜 Available Scripts

* **`yarn start`** → Development mode with live reload and console errors
* **`yarn build`** → Production-ready build in `build/`
* **`yarn test`** → Interactive test runner
* **`yarn eject`** → Expose Webpack/Babel/ESLint configuration (⚠️ irreversible)

---

## 🚀 Recommended Improvements

* Camera selection (front/back on mobile)
* Screenshot capture with detection overlays
* Object detection history logging
* Export statistics (CSV/JSON)
* Dark/light mode
* Class filter UI
* Video recording with annotations
* Support for image/video uploads
* Multi-language interface
* PWA support for mobile installation

---

## 📄 License

MIT License

