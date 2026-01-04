import argparse
import cv2
import mediapipe as mp
import numpy as np
import json
from pathlib import Path
from datetime import datetime

# ---------------- CONFIGURACIÓN ----------------

NUM_LANDMARKS = 21  # MediaPipe tiene 21 landmarks por mano
POSE_DIM = NUM_LANDMARKS * 2  # 21 landmarks × 2 coords (x, y) = 42 dimensiones

STABILITY_THRESHOLD = 0.03  # Cambio máximo permitido entre frames

# ---------------- ARGUMENTOS ----------------

def parse_args():
    p = argparse.ArgumentParser(description="Entrenamiento de gestos estáticos (POSE)")
    p.add_argument("--video", "-v", required=True)
    p.add_argument("--gesture-name", "-g", required=True)
    p.add_argument("--min-detection", type=float, default=0.5)
    p.add_argument("--min-tracking", type=float, default=0.5)
    p.add_argument("--stability-threshold", type=float, default=0.03, 
                   help="Umbral de estabilidad (menor = más estricto)")
    p.add_argument("--min-frames", type=int, default=5,
                   help="Mínimo de frames estables necesarios")
    p.add_argument("--headless", action="store_true")
    return p.parse_args()

# ---------------- EXTRACCIÓN DE POSE ----------------

def extract_pose(hand_landmarks):
    """
    Extrae todos los 21 landmarks en 2D (x, y) sin la coordenada z.
    Devuelve vector de 42 dimensiones: [x0, y0, x1, y1, ..., x20, y20]
    """
    pose = []
    for landmark in hand_landmarks.landmark:
        pose.extend([landmark.x, landmark.y])
    return np.array(pose, dtype=np.float32)

def normalize_pose(pose):
    """
    Centra la pose restando la media (traslación) y luego normaliza por norma L2.
    Esto hace la pose invariante a traslación y escala.
    """
    # Paso 1: Centrar (restar media)
    pose_centered = pose - np.mean(pose)
    
    # Paso 2: Normalizar por norma L2
    norm = np.linalg.norm(pose_centered)
    if norm < 1e-6:
        return pose_centered, 0.0
    
    return pose_centered / norm, norm

# ---------------- MAIN ----------------

def main():
    args = parse_args()

    mp_hands = mp.solutions.hands
    mp_draw = mp.solutions.drawing_utils

    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=args.min_detection,
        min_tracking_confidence=args.min_tracking,
        model_complexity=1
    )

    cap = cv2.VideoCapture(args.video)
    if not cap.isOpened():
        print("❌ No se pudo abrir el video")
        return

    poses_raw = []
    poses_normalized = []
    original_norms = []
    prev_pose = None

    print("\n🎥 ENTRENANDO GESTO:", args.gesture_name)
    print(f"📐 Dimensiones esperadas: {POSE_DIM}")
    print(f"⚙️  Umbral de estabilidad: {args.stability_threshold}")
    print(f"📊 Frames mínimos: {args.min_frames}")
    print("💡 Presiona 'q' para detener\n")

    frame_count = 0
    stable_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1

        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(image)
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        if results.multi_hand_landmarks:
            hand = results.multi_hand_landmarks[0]
            pose_raw = extract_pose(hand)

            # Verificar estabilidad comparando con el frame anterior (SIN normalizar)
            if prev_pose is not None:
                delta = np.linalg.norm(pose_raw - prev_pose)
                if delta < args.stability_threshold:
                    poses_raw.append(pose_raw)
                    pose_norm, original_norm = normalize_pose(pose_raw)
                    poses_normalized.append(pose_norm)
                    original_norms.append(original_norm)
                    stable_count += 1
                    
                    cv2.putText(image, f"ESTABLE ({stable_count})", (10, 30),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                else:
                    cv2.putText(image, f"MOVIMIENTO (delta={delta:.3f})", (10, 30),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 165, 255), 2)
            
            prev_pose = pose_raw

            if not args.headless:
                mp_draw.draw_landmarks(
                    image, hand, mp_hands.HAND_CONNECTIONS)
        
        if not args.headless:
            cv2.putText(image, f"Frame: {frame_count}", (10, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
            cv2.imshow("Entrenamiento POSE", image)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    cap.release()
    cv2.destroyAllWindows()
    hands.close()

    if len(poses_normalized) < args.min_frames:
        print(f"❌ Muy pocos frames estables: {len(poses_normalized)}/{args.min_frames} mínimo")
        print("💡 Consejos:")
        print("   - Mantén la mano más quieta durante más tiempo")
        print("   - Graba un video más largo (al menos 3-5 segundos)")
        print(f"   - Usa --stability-threshold 0.05 para ser menos estricto (actual: {args.stability_threshold})")
        print(f"   - Usa --min-frames 3 para reducir el mínimo (actual: {args.min_frames})")
        return

    poses_normalized = np.array(poses_normalized)
    
    # Calcular firma promedio (ya normalizada)
    pose_mean = np.mean(poses_normalized, axis=0)
    
    # Calcular distancias de cada pose al promedio
    distances = np.array([np.linalg.norm(p - pose_mean) for p in poses_normalized])
    
    # Estadísticas de distancias
    sigma = float(np.mean(distances))
    max_dist = float(np.max(distances))
    min_dist = float(np.min(distances))
    
    # UMBRAL MEJORADO: Basado en estadísticas reales
    # Usamos percentil 95 de las distancias observadas
    # Esto permite que el 95% de tus propios frames pasen la validación
    threshold_base = float(np.percentile(distances, 95))
    
    # Añadimos un margen de seguridad del 20%
    threshold = threshold_base * 1.2
    
    # OPCIONAL: Solo validar que no sea absurdamente grande
    if threshold > 0.2:
        print(f"⚠️ Umbral muy alto ({threshold:.4f}), considera regrabar el video")

    # ---------------- EXPORT JSON ----------------

    json_data = {
        "nombre": args.gesture_name,
        "tipo": "unimanual",
        "dimensiones": POSE_DIM,
        "firma_promedio": pose_mean.tolist(),
        "sigma": sigma,
        "umbral": threshold,
        "algoritmo": "POSE_STATIC_FULLHAND_CENTERED_NORMALIZED",
        "estadisticas": {
            "distancia_media": sigma,
            "distancia_maxima": max_dist,
            "distancia_minima": min_dist,
            "percentil_95": threshold_base,
            "norma_promedio_original": float(np.mean(original_norms))
        },
        "metadata": {
            "frames_estables": len(poses_normalized),
            "frames_totales": frame_count,
            "fecha_entrenamiento": datetime.now().isoformat(),
            "num_landmarks": NUM_LANDMARKS
        }
    }

    out_file = f"{args.gesture_name}_firma.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)

    print("\n✅ ENTRENAMIENTO COMPLETADO")
    print(f"📄 JSON generado: {out_file}")
    print(f"📐 Dimensión firma: {POSE_DIM} (21 landmarks × 2 coords)")
    print(f"📊 Frames estables: {len(poses_normalized)} / {frame_count} totales")
    print(f"\n📈 ESTADÍSTICAS DE DISTANCIAS:")
    print(f"   • Distancia media (sigma): {sigma:.4f}")
    print(f"   • Distancia mínima: {min_dist:.4f}")
    print(f"   • Distancia máxima: {max_dist:.4f}")
    print(f"   • Percentil 95: {threshold_base:.4f}")
    print(f"\n🎯 UMBRAL CALCULADO: {threshold:.4f}")
    print(f"   (Percentil 95 + 20% margen = {threshold_base:.4f} × 1.2)")
    print(f"\n💡 IMPORTANTE:")
    print(f"   • Este umbral permite que el 95% de tus frames de entrenamiento sean válidos")
    print(f"   • Asegúrate de usar la MISMA normalización en producción:")
    print(f"     1. Centrar: pose - mean(pose)")
    print(f"     2. Normalizar: pose_centered / norm(pose_centered)")

# ---------------- ENTRY POINT ----------------

if __name__ == "__main__":
    main()