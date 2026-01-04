# 🧏‍♂️ Real-Time Sign Language Translator

Real-time sign language recognition system using MediaPipe, SignalR and Machine Learning.

---

## ❤️ Motivation

While waiting for a bus, a deaf child tried to communicate with me using signs. When I explained that I didn't know sign language, he became sad. That moment made me reflect on how many barriers still exist—barriers that technology can help break down.

This project was born to create an accessible and functional translator using only a camera and a browser.

---

## 📋 Overview

**SignLanguageTranslator** is an ASP.NET Core 8 web application that enables real-time sign language gesture recognition through computer vision. It uses MediaPipe Hands to detect the hand, sends landmarks to the backend via SignalR, where a Machine Learning algorithm compares them with pre-trained gestures and returns the result to the frontend to display the detected gesture with voice synthesis.

### Key Features

- ✋ **Real-time hand detection** with MediaPipe Hands
- 🔄 **Bidirectional communication** via SignalR (WebSockets)
- 🧠 **Gesture recognition** using normalized Euclidean distance
- 📊 **Statistics dashboard** with charts (Chart.js) and live metrics
- 🔊 **Voice synthesis** (Text-to-Speech) to pronounce detected gestures
- 🎯 **Comparator mode** to manually train and validate gestures
- 📈 **Metrics system**: FPS, confidence, streaks, detection history
- 🐛 **Visual debugging** of landmarks and metrics on canvas

---

## 🏗️ Why is This an MVC Project?

This project **correctly implements the MVC (Model-View-Controller) pattern** in ASP.NET Core:

### **M - Model (Models)**

```
✅ Models/GestureSignature.cs - Data model for gesture signatures
✅ Models/DetectionResult.cs - Model for detection results
✅ Models/GestureMetadata.cs - Training metadata
✅ Models/GestureState.cs - Detection states
✅ Business logic encapsulated in services
✅ Clear separation of data representation
```

### **V - View (Views)**

```
✅ Views/Home/Index.cshtml - Main view with Razor
✅ Views/Comparador/Index.cshtml - Manual validation view
✅ Views/Statistics/Index.cshtml - Statistics view
✅ Views/About/Index.cshtml - Documentation view
✅ wwwroot/ - Static resources (CSS, JS, images)
✅ Shared layout (_Layout.cshtml)
✅ Reactive and interactive user interface
```

### **C - Controller (Controllers)**

```
✅ Controllers/HomeController.cs - Traditional HTTP controller
✅ Controllers/ComparadorController.cs - Validation controller
✅ Controllers/StatisticsController.cs - Statistics controller
✅ Controllers/AboutController.cs - Information controller
✅ Hubs/CameraHub.cs - Real-time controller (SignalR)
✅ Route handling and presentation logic
✅ Orchestration between services and views
```

### **Complete MVC + Services Architecture**

```
┌─────────────────────────────────────────┐
│           CLIENT (Browser)              │
│  ┌─────────────┐      ┌──────────────┐ │
│  │ MediaPipe   │ ───> │   SignalR    │ │
│  │  Hands JS   │      │   Client     │ │
│  └─────────────┘      └──────────────┘ │
└────────────────────┬────────────────────┘
                     │ WebSocket/HTTP
┌────────────────────▼────────────────────┐
│        SERVER (ASP.NET Core MVC)        │
│                                          │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │  CameraHub   │  │ HomeController  │ │ ◄── CONTROLLER
│  │  (SignalR)   │  │     (MVC)       │ │
│  └──────┬───────┘  └────────┬────────┘ │
│         │                   │           │
│         └──────┬────────────┘           │
│                │                        │
│  ┌─────────────▼──────────────────┐    │
│  │  GestureDetectorService        │    │ ◄── BUSINESS LOGIC
│  │  (Business Logic)              │    │     (Service Layer)
│  └─────────────┬──────────────────┘    │
│                │                        │
│  ┌─────────────▼──────────────────┐    │
│  │  GestureSignatureService       │    │ ◄── DATA ACCESS
│  │  (Data Access - JSON)          │    │     (Repository)
│  └────────────────────────────────┘    │
│                                         │
│  ┌────────────────────────────────┐    │
│  │  Models/                       │    │ ◄── MODEL
│  │  - GestureSignature            │    │
│  │  - DetectionResult             │    │
│  │  - GestureMetadata             │    │
│  │  - GestureState                │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Views/                                 │ ◄── VIEW
│  - Home/Index.cshtml                    │
│  - Comparador/Index.cshtml              │
│  - Statistics/Index.cshtml              │
│  - About/Index.cshtml                   │
│  - Shared/_Layout.cshtml                │
└─────────────────────────────────────────┘
```

---

## 🌟 What Makes This MVC Project Stand Out

### **1. Not a Traditional CRUD**

Most MVC projects are limited to basic operations (Create, Read, Update, Delete). This project implements:

- **Real-time video processing**
- **AI-powered gesture detection**
- **Complex pattern recognition**
- **Bidirectional communication with WebSockets**

### **2. Advanced AI Integration**

- Uses **Machine Learning** directly in the browser (MediaPipe)
- Frame-by-frame image processing (30-60 FPS)
- Normalization and vector comparison algorithms
- Temporal consensus system for stabilization

### **3. Professional Architecture**

```
✅ Repository Pattern implemented (Services)
✅ Dependency Injection (DI)
✅ Separation of Concerns (SoC)
✅ Well-defined interfaces (IGestureDetectorService, etc.)
✅ Structured logging
```

### **4. Real-Time Communication**

```csharp
// This is NOT common in basic MVC projects
public async Task ReceiveKeypoints(double[] keypoints)
{
    var result = await _gestureDetectorService.ProcessFrame(keypoints);
    if (result.Detected)
    {
        await Clients.All.SendAsync("GestureDetected", result);
    }
}
```

### **5. High Technical Complexity**

```javascript
// Client: AI processing and real-time sending
const landmarks = results.multiHandLandmarks[0];
const keypoints = flattenLandmarks(landmarks);
await signalRManager.sendKeypoints(keypoints);
```

---

## 🧱 Technology Stack

**Backend (MVC)**

- .NET 8 · ASP.NET Core MVC
- SignalR (Bidirectional WebSockets)
- Dependency Injection
- Services with interfaces (Repository Pattern)

**Frontend (View)**

- JavaScript ES6+ (Modular)
- MediaPipe Hands (TensorFlow.js)
- SignalR JavaScript Client
- Bootstrap 5
- Chart.js (statistics visualization)
- Canvas 2D API (visual debugging)
- Web Speech API (TTS)

**Persistence (Model)**

- JSON (gesture signatures)
- Typed models (C# POCO classes)

**Gesture Training**

- Python 3.8+
- OpenCV (video processing)
- MediaPipe Python SDK
- NumPy (vector calculations)

---

## 📁 Project Structure (MVC Pattern)

```
SignLanguageTranslator/
├── Controllers/              ◄── CONTROLLER
│   ├── HomeController.cs
│   ├── ComparadorController.cs
│   ├── StatisticsController.cs
│   └── AboutController.cs
├── Hubs/                     ◄── CONTROLLER (SignalR)
│   └── CameraHub.cs
├── Models/                   ◄── MODEL
│   ├── DetectionResult.cs
│   ├── GestureSignature.cs
│   ├── GestureMetadata.cs
│   ├── GestureState.cs
│   └── ErrorViewModel.cs
├── Services/                 ◄── BUSINESS LOGIC
│   ├── GestureDetectorService.cs
│   └── GestureSignatureService.cs
├── Interfaces/               ◄── SERVICE CONTRACTS
│   ├── IGestureDetectorService.cs
│   └── IGestureSignatureService.cs
├── Views/                    ◄── VIEW
│   ├── Home/
│   │   └── Index.cshtml
│   ├── Comparador/
│   │   └── Index.cshtml
│   ├── Statistics/
│   │   └── Index.cshtml
│   ├── About/
│   │   └── Index.cshtml
│   └── Shared/
│       └── _Layout.cshtml
├── wwwroot/                  ◄── VIEW (Assets)
│   ├── js/
│   │   ├── modules/
│   │   │   ├── mediapipe-hands.js
│   │   │   ├── statistics.js
│   │   │   └── statistics-detector.js
│   │   ├── main.js
│   │   ├── comparador.js
│   │   └── signalr-manager.js
│   ├── css/
│   └── gestures/             ◄── DATA
│       └── *_firma.json
├── training/                 ◄── PYTHON TRAINING SCRIPTS
│   └── train_gesture.py
└── Program.cs                ◄── Configuration & DI
```

---

## 🔁 System Workflow (MVC in Action)

### Complete System Flow

1. **REQUEST** → User accesses `/Home/Index`
2. **CONTROLLER** → `HomeController.Index()` returns the view
3. **VIEW** → `Index.cshtml` is rendered with embedded JavaScript
4. **CLIENT-SIDE**:
   - Activates camera with `getUserMedia()`
   - MediaPipe processes frames → extracts landmarks (21 3D points)
   - Filters only the user's left hand
   - Converts landmarks to flat array `[x1,y1, x2,y2, ...]` (42 values)
   - SignalR sends keypoints to server (30-60 times per second)
5. **CONTROLLER** → `CameraHub.ReceiveKeypoints()` receives data
6. **SERVICE** → `GestureDetectorService` normalizes and classifies
7. **MODEL** → Compared with `GestureSignature` (JSON signatures)
8. **RESPONSE** → SignalR sends `DetectionResult` to client via `Clients.All`
9. **VIEW UPDATE** → JavaScript updates UI:
   - Fires `CustomEvent('gestureDetected')`
   - `statistics.js` updates metrics and charts
   - `main.js` displays the gesture and plays it with voice synthesis

---

## 🧠 Classifier Mathematics

### 1) Gesture Representation

Each frame is converted to a numerical vector with key points. The backend expects **42 values**:

```
21 landmarks × (x, y) = 42 values
```

MediaPipe detects 21 3D points per hand, but we only use 2D coordinates (x, y):

```javascript
// Example landmarks
[
  {x: 0.523, y: 0.412, z: -0.035},  // WRIST
  {x: 0.547, y: 0.389, z: -0.042},  // THUMB_CMC
  {x: 0.571, y: 0.365, z: -0.049},  // THUMB_MCP
  ...
]

// Converted to flat array (42 values)
[0.523, 0.412, 0.547, 0.389, 0.571, 0.365, ...]
```

### 2) Normalization (for robustness)

Before comparing, normalization is applied to reduce variations due to translation/scale:

**Step 1: Centering** - The mean is subtracted from the vector
```javascript
mean = Σ(xᵢ) / n
centered = [x₁-mean, x₂-mean, ..., xₙ-mean]
```

**Step 2: L2 Normalization** - Divide by the norm
```javascript
norm = √(Σ(xᵢ²))
normalized = [x₁/norm, x₂/norm, ..., xₙ/norm]
```

**Result:** A norm-1 vector centered at 0 representing only the **shape** of the gesture.

**C# Code (Backend):**
```csharp
private double[] NormalizeKeypoints(double[] keypoints)
{
    double mean = keypoints.Average();
    var centered = keypoints.Select(k => k - mean).ToArray();
    
    double norm = Math.Sqrt(centered.Sum(k => k * k));
    if (norm < 0.000001) return centered;
    
    return centered.Select(k => k / norm).ToArray();
}
```

**Why normalize?**
- ✅ Invariant to **hand size** (children vs adults)
- ✅ Invariant to **distance from camera** (near vs far)
- ✅ Invariant to **position in frame** (left, center, right)

### 3) Comparison Against Signatures (Templates)

Each gesture has a **signature** `s_g` (average vector) and a **threshold** `t_g` stored in JSON.

For each gesture `g`, the **Euclidean distance** is calculated:

```
d_g = √Σ(x_normᵢ - s_gᵢ)²
```

**C# Code (Backend):**
```csharp
private double EuclideanDistance(double[] a, double[] b)
{
    double sum = 0;
    for (int i = 0; i < a.Length; i++)
    {
        double diff = a[i] - b[i];
        sum += diff * diff;
    }
    return Math.Sqrt(sum);
}
```

The gesture with the **lowest distance** is selected.

### 4) Threshold and Confidence

It validates whether the gesture falls within the threshold:

```csharp
if (best.distance > best.gesture.Umbral)
{
    // No detection - gesture is too far from signature
    return DetectionResult.NoDetection();
}
```

And an **approximate confidence** is calculated:

```csharp
double confidence = Math.Max(0, 1.0 - (best.distance / best.gesture.Umbral));
```

**Example:**
```
distance = 0.15
threshold = 0.8
confidence = 1 - (0.15/0.8) = 0.8125 → 81.25%
```

### 5) Temporal Consensus and Cooldown

To stabilize recognition, the server maintains a **circular queue** and requires multiple votes:

```csharp
const int CONSENSUS_WINDOW = 5;      // Frames considered
const int REQUIRED_CONSENSUS = 3;    // Minimum votes
const int COOLDOWN_MS = 1500;        // Minimum time between repetitions
```

---

## 🎯 Pre-Trained Signature System

### JSON File Format

Each gesture has a JSON file in `wwwroot/gestures/` with this structure:

```json
{
  "nombre": "A",
  "tipo": "estático",
  "dimensiones": 42,
  "firma_promedio": [
    0.123, -0.456, 0.789, -0.234, ...  // 42 values
  ],
  "sigma": 0.025,
  "umbral": 0.80,
  "algoritmo": "POSE_STATIC",
  "metadata": {
    "fecha_entrenamiento": "2025-01-04T12:00:00Z",
    "frames_estables": 15
  }
}
```

---

## 🐍 Signature Generation with Python

### How Are Gestures Trained?

JSON signatures are generated using a Python script that processes videos with the gesture to be trained:

### Training Script: `train_gesture.py`

**Implemented Algorithm:**

```python
# 1. Landmark extraction (21 3D points → 42 2D values)
def extract_pose(hand_landmarks):
    pose = []
    for landmark in hand_landmarks.landmark:
        pose.extend([landmark.x, landmark.y])  # Only x,y (without z)
    return np.array(pose, dtype=np.float32)

# 2. Normalization (centering + scaling)
def normalize_pose(pose):
    pose_centered = pose - np.mean(pose)  # Center at 0
    norm = np.linalg.norm(pose_centered)  # Calculate L2 norm
    return pose_centered / norm, norm     # Normalize

# 3. Stability detection (filtering noisy frames)
# Only frames where the change from the previous one
# is less than a threshold (default: 0.03) are captured
if prev_pose is not None:
    delta = np.linalg.norm(pose_raw - prev_pose)
    if delta < STABILITY_THRESHOLD:
        poses_normalized.append(pose_norm)  # Valid frame

# 4. Average signature calculation
pose_mean = np.mean(poses_normalized, axis=0)

# 5. Threshold calculation based on real statistics
# Uses 95th percentile of distances + 20% margin
distances = [np.linalg.norm(p - pose_mean) for p in poses_normalized]
threshold = np.percentile(distances, 95) * 1.2
```

### Script Usage

```bash
# Install dependencies
pip install opencv-python mediapipe numpy

# Train a gesture from video
python training/train_gesture.py \
  --video videos/letter_A.mp4 \
  --gesture-name "A" \
  --stability-threshold 0.03 \
  --min-frames 5

# Output: A_firma.json
```

### Script Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--video` | Path to training video | *Required* |
| `--gesture-name` | Gesture name (e.g., "A", "B") | *Required* |
| `--stability-threshold` | Maximum change between frames (lower = stricter) | 0.03 |
| `--min-frames` | Minimum stable frames required | 5 |
| `--min-detection` | Minimum MediaPipe confidence | 0.5 |
| `--headless` | Run without visualization window | False |

### Training Output Example

```
🎥 TRAINING GESTURE: A
📐 Expected dimensions: 42
⚙️ Stability threshold: 0.030
📊 Minimum frames: 5

[Processing video...]

✅ TRAINING COMPLETED
📄 Generated JSON: A_firma.json
📐 Signature dimension: 42 (21 landmarks × 2 coords)
📊 Stable frames: 18 / 120 total

📈 DISTANCE STATISTICS:
   • Average distance (sigma): 0.0234
   • Minimum distance: 0.0089
   • Maximum distance: 0.0567
   • 95th percentile: 0.0512

🎯 CALCULATED THRESHOLD: 0.0614
   (95th percentile + 20% margin = 0.0512 × 1.2)
```

### Complete Training Pipeline

```
1. Record video (3-5 sec, hand still making the gesture)
        ↓
2. Run train_gesture.py
        ↓
3. Script detects stable frames
        ↓
4. Extracts and normalizes landmarks
        ↓
5. Calculates average signature and optimal threshold
        ↓
6. Generates JSON with complete statistics
        ↓
7. Copy JSON to wwwroot/gestures/
        ↓
8. Restart .NET application
```

### Training Algorithm Advantages

- ✅ **Stability filtering**: Only captures frames where the hand is still
- ✅ **Adaptive threshold**: Calculated based on your own data (95th percentile)
- ✅ **Robust normalization**: Invariant to position, scale and hand size
- ✅ **Complete statistics**: Includes training quality metrics
- ✅ **No overfitting**: The 20% margin allows generalization

### Tips for Better Results

1. **Record 3-5 second videos** keeping your hand still
2. **Uniform background** (preferably white or plain)
3. **Constant lighting** (avoid strong shadows)
4. **Fixed camera** (don't move the camera during recording)
5. **Centered hand** in the frame
6. **Multiple angles**: Record the same gesture from different perspectives and train several times, then average

---

## 🚀 Installation and Usage

### Prerequisites

- .NET 8.0 SDK or higher
- MediaPipe-compatible browser (Chrome, Edge recommended)
- Functional webcam
- Python 3.8+ (only for gesture training)

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/SignLanguageTranslator.git
cd SignLanguageTranslator

# 2. Restore .NET dependencies
dotnet restore

# 3. Build the project
dotnet build

# 4. (Optional) Install Python dependencies for training
pip install opencv-python mediapipe numpy

# 5. Run the application
dotnet run
```

The application will be available at `https://localhost:5001` (or the configured port).

### URL Structure

```
/                      → Main page with live detector
/Comparador           → Manual gesture validation mode
/Statistics           → Advanced statistics panel with charts
/About                → Project information
```

### Adding New Gestures

1. **Record gesture video:**
   ```bash
   # Record 3-5 seconds with hand still making the gesture
   # Save as: videos/my_gesture.mp4
   ```

2. **Train with Python:**
   ```bash
   python training/train_gesture.py \
     --video videos/my_gesture.mp4 \
     --gesture-name "MyGesture" \
     --stability-threshold 0.03
   ```

3. **Copy generated JSON:**
   ```bash
   cp MyGesture_firma.json wwwroot/gestures/
   ```

4. **Restart the application:**
   ```bash
   dotnet run
   ```

---

## 📊 Statistics System

### Collected Metrics

**statistics.js** maintains in memory:

```javascript
{
  totalDetections: 0,           // Total counter
  confidenceSum: 0,             // For average
  gestureFrequency: {},         // Frequency by gesture
  currentStreak: 0,             // Current streak
  maxStreak: 0,                 // Maximum streak
  detectionHistory: [],         // Last 10 detections
  confidenceHistory: []         // Last 20 values (chart)
}
```

### Visualizations with Chart.js

1. **Bar Chart**: Frequency of detected gestures
2. **Line Chart**: Real-time confidence evolution

### CSV Export

```csv
ID,Gesture,Confidence (%),Timestamp,Time since previous
1,A,92.50,15:30:45,250ms
2,B,87.30,15:30:46,1.2s

Summary
Total Detections,50
Average Confidence,89.50%
```

---

## 🐛 Debugging

### Detector Debug Mode

**Activate from interface:**
- "Debug Mode" button in the top right corner
- Panel with live metrics: FPS, landmarks, confidence

**Activate from console:**
```javascript
detector.toggleDebugMode()
detector.showLabels = true
detector.showConnections = true
```

### Useful Logs

**Frontend:**
```
✅ SignalR Manager: Connected
👁️ MediaPipe configured
🎯 Gesture detected: A (confidence: 92.5%)
```

**Backend:**
```
✅ GestureDetectorService ready (8 gestures loaded)
🟢 Gesture 'A' | Confidence: 92% | Separation: 2.50x
📡 GestureDetected event sent
```

---

## ⚠️ Known Limitations

### Technical

1. **Left hand only**: Filters and processes only the left hand
2. **Static gestures**: Doesn't recognize gestures with movement
3. **Simple Euclidean distance**: Not robust against extreme rotations

### Performance

1. **CPU-bound**: Synchronous processing
2. **No throttling**: Processes all frames (30-60 FPS)
3. **SignalR broadcast**: Sends to all clients

---

## 🔮 Future Improvements

### Short Term

- [ ] **Intelligent throttling**: Reduce to 10-15 FPS without losing fluidity
- [ ] **JSON validation**: Schema validation when loading signatures
- [ ] **Asynchronous processing**: `Task.Run()` in the Hub

### Medium Term

- [ ] **Both hands**: Recognize bimanual gestures
- [ ] **Dynamic gestures**: Implement DTW for movement
- [ ] **User calibration**: Adapt individual thresholds
- [ ] **Database**: Migrate from JSON to SQL/NoSQL

### Long Term

- [ ] **Migrate to TensorFlow.js**: Neural network for greater robustness
- [ ] **GPU Acceleration**: CUDA/OpenCL for calculations
- [ ] **Multi-gesture**: Recognize gesture sequences

---

## 🙏 Acknowledgments

- **MediaPipe**: Google's computer vision framework
- **SignalR**: ASP.NET Core real-time communication
- **Chart.js**: JavaScript charting library
- **Bootstrap**: CSS framework for the interface

---

## 📚 References

- [MediaPipe Hands Documentation](https://google.github.io/mediapipe/solutions/hands.html)
- [SignalR ASP.NET Core Documentation](https://docs.microsoft.com/en-us/aspnet/core/signalr/)
- [Speech Synthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)

- [ASP.NET Core MVC Pattern](https://docs.microsoft.com/en-us/aspnet/core/mvc/overview)
