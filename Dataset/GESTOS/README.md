🎯 Sistema de Reconocimiento de Gestos Estáticos (POSE)

Sistema de entrenamiento y detección online de gestos estáticos en Lengua de Signos Española (LSE) basado en análisis de poses de mano capturadas con MediaPipe. Genera firmas normalizadas invariantes a traslación y escala.

## ✨ Características

- ✅ Entrenamiento offline de firmas de gestos estáticos
- ✅ Invariante a traslación y escala (normalización centering + L2)
- ✅ Detección online en tiempo real con webcam
- ✅ Cálculo automático de umbrales basado en percentiles
- ✅ Exportación a JSON para integración con backend C#
- ✅ Visualización en tiempo real de similitudes coseno
- ✅ Optimización de firmas con técnicas avanzadas (PCA whitening, amplificación)

---

## 📦 Requisitos

```txt
opencv-python>=4.8.0
mediapipe>=0.10.0
numpy>=1.24.0
```

Python: 3.8 o superior

---

## 🚀 Instalación

1) Ubicarse en el proyecto

```bash
cd GESTOS
```

2) Crear entorno virtual (recomendado)

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate
```

3) Instalar dependencias

```bash
pip install -r requirements.txt
```

---

## 📊 Ejemplo de JSON Generado

```json
{
  "nombre": "curioso",
  "tipo": "unimanual",
  "dimensiones": 42,
  "firma_promedio": [
    0.0123, -0.0456, 0.0789, ..., -0.0234
  ],
  "sigma": 0.0245,
  "umbral": 0.0588,
  "algoritmo": "POSE_STATIC_FULLHAND_CENTERED_NORMALIZED",
  "estadisticas": {
    "distancia_media": 0.0245,
    "distancia_maxima": 0.0567,
    "distancia_minima": 0.0012,
    "percentil_95": 0.049,
    "norma_promedio_original": 0.89
  },
  "metadata": {
    "frames_estables": 45,
    "frames_totales": 120,
    "fecha_entrenamiento": "2025-12-29T14:32:18.123456",
    "num_landmarks": 21
  }
}
```

---

## 🎯 Workflow Recomendado

### Para Entrenamiento Inicial

```bash
# 1. Crear y activar entorno virtual
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Grabar video del gesto (3-5 segundos, mano quieta)
# Usar teléfono, webcam o cámara - formato: .mov, .mp4, .avi

# 4. Entrenar gesto
python train_gesture.py --video curioso.mov --gesture-name curioso

# 5. Ver el JSON generado
type curioso_firma.json  # Windows
cat curioso_firma.json   # Linux/Mac
```

### Para Validación en Webcam

```bash
# 1. Entrenar mínimo 2 gestos (ej: curioso, inteligencia)
python train_gesture.py --video curioso.mov --gesture-name curioso
python train_gesture.py --video inteligencia.mov --gesture-name inteligencia
```

### Para Exportar a C#

```bash
# 1. Entrenar todos los gestos necesarios
for gesto in curioso inteligencia adaptar;
do
    python train_gesture.py --video $gesto.mov --gesture-name $gesto
done

# 2. (Opcional) Optimizar firmas si detección es baja
python optimize_signatures.py

# 3. Copiar JSONs a tu proyecto C#
# cp *.json /ruta/proyecto/csharp/gestures/
```

---

## ⚡ Consejos Prácticos

✅ **HACER**:
- Grabar videos en ambiente bien iluminado
- Mantener la mano **completamente visible** en el frame
- Usar fondo simple (evita sombras complicadas)
- Hacer el gesto de forma **clara y decidida**
- Dejar la mano quieta al final del gesto (estado estable)

❌ **EVITAR**:
- Cambios rápidos de iluminación durante la grabación
- Mano parcialmente fuera del frame
- Gestos muy pequeños o movimientos micro
- Movimientos innecesarios después del gesto
- Videos menores a 2 segundos

---

## 🐛 Debug y Logging

### Ver información de entrenamiento

```bash
python train_gesture.py --video curioso.mov --gesture-name curioso
# Mostrará:
# - Número de frames estables
# - Distancia media, mín, máx
# - Percentil 95
# - Umbral calculado
```

### Verificar JSON manualmente

```bash
python -c "import json; data=json.load(open('curioso_firma.json')); print(f\"Umbral: {data['umbral']}, Sigma: {data['sigma']}, Frames: {data['metadata']['frames_estables']}\")"
```

---

## 🔄 Flujo de Trabajo

```
Video del gesto → train_gesture.py
        ↓
Extracción de keypoints (21 landmarks × 2 coords = 42D)
        ↓
Normalización: centrado + división por norma L2
        ↓
Cálculo de firma: promedio de poses normalizadas
        ↓
Cálculo de umbral: percentil 95 + 20% margen
        ↓
📁 Salida: <gesto>_firma.json
        
        ↓ (Fase Offline)
        
        ↓ (Fase Online)
        
Webcam → detect_gesture.py
        ↓
Extracción keypoints en tiempo real
        ↓
Buffer circular de N frames
        ↓
Similitud coseno: cos(P_d, F_d,i)
        ↓
Comparar con umbral → DETECTADO/NO DETECTADO
        ↓
Panel visual con resultados
```

---

## 📚 Comandos Detallados

### Script: `train_gesture.py` (Entrenamiento de Firma)

Entrena una posición/gesto estático y genera su firma normalizada.

**Uso básico:**

```bash
python train_gesture.py --video <archivo.mov> --gesture-name <nombre>
```

**Ejemplos:**

```bash
# Entrenamiento simple (pose estática)
python train_gesture.py --video curioso.mov --gesture-name curioso

# Reducir requisito de estabilidad (más tolerante)
python train_gesture.py --video curioso.mov --gesture-name curioso --stability-threshold 0.05 --min-frames 3

# Modo sin GUI (servidor)
python train_gesture.py --video inteligencia.mov --gesture-name inteligencia --headless

# Aumentar tolerancia de detección MediaPipe
python train_gesture.py --video inteligencia.mov --gesture-name inteligencia --min-detection 0.3
```

**Parámetros principales:**

| Parámetro | Descripción | Default | Rango |
|-----------|-------------|---------|-------|
| `--video, -v` | Ruta del video (requerido) | - | - |
| `--gesture-name, -g` | Nombre del gesto (requerido) | - | - |
| `--stability-threshold` | Cambio máximo permitido entre frames | 0.03 | 0.01 - 0.1 |
| `--min-frames` | Frames estables mínimos | 5 | 3 - 30 |
| `--min-detection` | Confianza mínima MediaPipe | 0.5 | 0.1 - 0.9 |
| `--min-tracking` | Confianza tracking MediaPipe | 0.5 | 0.1 - 0.9 |
| `--headless` | Sin ventana visual | False | Flag |

**Salida del entrenamiento:**

- `<gesto>_firma.json` - Metadatos y firma normalizada (42 dimensiones)

**Ejemplo de JSON generado:**

```json
{
  "nombre": "curioso",
  "tipo": "unimanual",
  "dimensiones": 42,
  "firma_promedio": [...],
  "sigma": 0.0245,
  "umbral": 0.0588,
  "algoritmo": "POSE_STATIC_FULLHAND_CENTERED_NORMALIZED",
  "estadisticas": {
    "distancia_media": 0.0245,
    "distancia_maxima": 0.0567,
    "distancia_minima": 0.0012,
    "percentil_95": 0.049,
    "norma_promedio_original": 0.89
  },
  "metadata": {
    "frames_estables": 45,
    "frames_totales": 120,
    "fecha_entrenamiento": "2025-12-29T...",
    "num_landmarks": 21
  }
}
```

---

### Script: `optimize_signatures.py` (Optimización de Firmas)

Optimiza múltiples firmas para mejorar discriminación entre gestos.

**Requisitos previos:**

Edita las rutas en el script:

```python
INPUT_DIR = r"C:\ruta\donde\estan\los\*.json"
OUTPUT_DIR = r"C:\ruta\salida\gestures_optimized"
```

**Técnicas de optimización:**

- **PCA Whitening**: Decorrelaciona y normaliza varianza
- **Feature Scaling**: Amplifica características discriminativas
- **Amplification Factor**: Aumenta diferencias respecto al centroide
- **Threshold Adjustment**: Recalcula umbrales óptimos

**Ejecución:**

```bash
python optimize_signatures.py
```

Genera JSON optimizados en `OUTPUT_DIR`.

---

---

## 🧩 Integración con Backend C#

### Flujo de Deployement

1. **Entrenamiento** (Fase Offline)
   ```bash
   python train_gesture.py --video curioso.mov --gesture-name curioso
   ```
   Genera: `a_firma.json`

2. **Copiado a C#**
   - Copia `<gesto>_firma.json` a tu proyecto MVC
   - Mapea los campos JSON a tu modelo C#

3. **Uso en Backend**
   - Lee `firma_promedio` (vector de 42 dimensiones normalizado)
   - Lee `umbral` para decisión binaria
   - Lee `sigma` para estadísticas/logging
   - Aplica la MISMA normalización al procesar keypoints en runtime

### Campos JSON Clave para C#

```json
{
  "nombre": "curioso",                    // ID del gesto
  "tipo": "unimanual",                    // Solo mano derecha
  "dimensiones": 42,                      // 21 landmarks × 2 coords
  "firma_promedio": [...],                // Vector de firma (array de 42 floats)
  "sigma": 0.0245,                        // Variabilidad entrenada
  "umbral": 0.0588,                       // Umbral de detección
  "algoritmo": "POSE_STATIC_FULLHAND_CENTERED_NORMALIZED"
}
```

### Pseudocódigo C# para Detección

```csharp
// En el cliente (cada frame)
var pose = ExtractHandKeypoints(landmarks);  // 42D
var normalized = NormalizePose(pose);        // Centrado + L2

// En el servidor (buffer de N frames)
var bufferAvg = Buffer.Average();            // P_d = promedio buffer
var similarity = CosineSimilarity(bufferAvg, firma.SignatureVector);

if (similarity >= firma.Threshold)
{
    DetectedGesture = firma.Name;
}
```

### Normalización CRÍTICA

La normalización debe ser **idéntica** en Python (entrenamiento) y C# (producción):

```
1. Centrado:    pose_centered = pose - mean(pose)
2. Normalizar:  pose_norm = pose_centered / norm(pose_centered)
```

Este paso es obligatorio para que el gesto se reconozca correctamente.

---

## 📁 Estructura de Archivos

```
GESTOS/
├── .venv/                          # Entorno virtual
├── README.md                        # Este archivo
├── requirements.txt                 # Dependencias
├── train_gesture.py                 # Entrenamiento de gestos
├── detect_gesture.py                # Detección online
├── optimize_signatures.py           # Optimización de firmas
│
├── curioso_firma.json               # Firma entrenada (ejemplo)
├── inteligencia_firma.json          # Otra firma entrenada (ejemplo)
│
├── videos_gestos/                   # Carpeta donde debes poner los videos de los gestos
│   
│
└── gestures_optimized/              # Firmas optimizadas (salida)
    ├── curioso.json
    └── inteligencia.json

```

---

## 🔧 Solución de Problemas

### Problema: "Muy pocos frames estables"

**Causa**: La mano se mueve demasiado o el video es muy corto.

**Soluciones**:
```bash
# Reducir exigencia de estabilidad
python train_gesture.py --video curioso.mov --gesture-name curioso --stability-threshold 0.05

# Reducir frames mínimos
python train_gesture.py --video curioso.mov --gesture-name curioso --min-frames 3

# Aumentar tolerancia MediaPipe
python train_gesture.py --video curioso.mov --gesture-name curioso --min-detection 0.3
```

---

### Problema: Detección poco fiable (falsos positivos)

**Causa**: El umbral es demasiado bajo o la firma no es representativa.

**Soluciones**:
- Regrabar con gesto más estable y definido
- Usar `--buffer-size` mayor en `detect_gesture.py` (ej: 15)
- Optimizar firmas con `optimize_signatures.py`

---

## 🧮 Modelo Matemático

### Notación

- `f_t ∈ ℝ⁴²` - Vector de pose (21 landmarks × 2 coords)
- `F_d,i ∈ ℝ⁴²` - Firma del gesto (normalizada)
- `P_d ∈ ℝ⁴²` - Promedio del buffer temporal
- `σ` - Variabilidad (desviación estándar de distancias)

### Algoritmo

**1. Normalización (Entrenamiento)**
```
pose_centered = f - mean(f)
pose_norm = pose_centered / ||pose_centered||₂
```

**2. Firma (Entrenamiento)**
```
F_d,i = (1/M) Σ pose_norm  (promedio de M poses normalizadas)
```

**3. Umbral (Entrenamiento)**
```
umbral = percentil_95(distancias) × 1.2
```

**4. Similitud (Detección)**
```
sim = cos(P_d, F_d,i) = (P_d · F_d,i) / (||P_d|| · ||F_d,i||)
```

**5. Decisión (Detección)**
```
if sim >= umbral:
    GESTO DETECTADO
else:
    NO DETECTADO
```

---

## 🏗️ Arquitectura Técnica

### Componentes

1. **MediaPipe Hands** (Input)
   - Extrae 21 landmarks por mano
   - Retorna coordenadas normalizadas (0-1)
   - Ofrece confianza de detección y tracking

2. **Normalización** (Preprocessing)
   - Centrado: `pose - mean(pose)`
   - L2 Normalization: `pose / norm(pose)`
   - Invariante a traslación y escala

3. **Firma (Signature)** (Modelo)
   - Promedio de poses normalizadas
   - Vector 42-dimensional
   - Representa gesto "canónico"

4. **Umbral (Threshold)**
   - Basado en percentil 95 de distancias
   - Más robusto que umbrales fijos
   - Adapta a variabilidad del entrenamiento

5. **Detección Online**
   - Buffer circular de N frames
   - Promedio del buffer
   - Similitud coseno vs firma
   - Cooldown anti-rebote

### Archivos Clave

| Archivo | Líneas | Función |
|---------|--------|---------|
| `train_gesture.py` | 224 | Entrenamiento de firmas |
| `optimize_signatures.py` | 310 | Optimización batch |

---

## 📋 Validación de Entrada

La siguiente tabla muestra qué verifica cada script:

| Validación | Train | Detect | Optimize |
|------------|-------|--------|----------|
| Archivo video existe | ✅ | - | - |
| Archivo JSON existe | - | ✅ | ✅ |
| MediaPipe detecta mano | ✅ | ✅ | - |
| Frames estables suficientes | ✅ | - | - |
| Compatibilidad dimensiones | ✅ | ✅ | ✅ |

---

## 🔑 Parámetros Críticos

### `stability_threshold` (train_gesture.py)
- **Qué es**: Cambio máximo entre frames para considerarlo estable
- **Default**: 0.03
- **Aumentar si**: Video es inestable, hay vibración pequeña
- **Reducir si**: Aceptas movimiento leve durante entrenamiento
- **Rango típico**: 0.01 - 0.1

### `buffer_size` (detect_gesture.py)
- **Qué es**: Número de frames para promediar antes de evaluar
- **Default**: 10
- **Aumentar si**: Detección es muy sensible, muchos falsos positivos
- **Reducir si**: Necesitas respuesta rápida
- **Rango típico**: 5 - 20

### `cooldown` (detect_gesture.py)
- **Qué es**: Frames a esperar antes de permitir nueva detección
- **Default**: 20
- **Aumentar si**: Detecta el mismo gesto múltiples veces
- **Reducir si**: Necesitas detectar gestos rápidamente
- **Rango típico**: 10 - 40

---

## 🎓 Limitaciones Conocidas

### Generales

1. **Solo gestos estáticos**: No detecta gestos dinámicos (movimiento continuo)
2. **Una mano por frame**: Aunque se puede entrenar bimanual, detect espera una sola
3. **Dependencia de iluminación**: Varía significativamente con condiciones de luz
4. **Oclusiones parciales**: Si dedos están ocultos, MediaPipe falla

### Matemáticas

1. **Similitud coseno**: No captura diferencias de amplitud (ambas normalizadas)
2. **Percentil fijo**: El umbral es estático (no se adapta en runtime)
3. **Invariancia incompleta**: Centro en eje XY pero no en rotación

---
