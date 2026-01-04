import json
import numpy as np
from pathlib import Path

# ================== CONFIGURACIÓN ==================
INPUT_DIR = r"C:\Users\heily\Desktop\Master\3.-BACK AVANZADO\TraductorDeSignos\TraductorDeSignos\TraductorDeSignos\wwwroot\gestures"
OUTPUT_DIR = r"C:\Users\heily\Desktop\Master\3.-BACK AVANZADO\TraductorDeSignos\TraductorDeSignos\TraductorDeSignos\wwwroot\gestures_optimized"

# Técnicas de optimización a aplicar
APPLY_PCA_WHITENING = True      # Amplifica diferencias principales
APPLY_FEATURE_SCALING = True    # Re-escala características importantes
AMPLIFICATION_FACTOR = 1.5      # Factor de amplificación de diferencias
ADJUST_THRESHOLDS = True        # Recalcula umbrales óptimos


# ================== FUNCIONES PRINCIPALES ==================

def load_signatures(directory):
    """Carga todas las firmas desde archivos JSON"""
    signatures = {}
    for json_file in Path(directory).glob("*.json"):
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            name = data['nombre']
            signatures[name] = {
                'data': data,
                'vector': np.array(data['firma_promedio'])
            }
    return signatures


def compute_centroid(signatures):
    """Calcula el centroide de todas las firmas"""
    vectors = [sig['vector'] for sig in signatures.values()]
    return np.mean(vectors, axis=0)


def amplify_differences(signatures, centroid, factor=1.5):
    """
    Amplifica las diferencias respecto al centroide.
    Esto hace que gestos similares se separen más.
    """
    optimized = {}
    
    for name, sig in signatures.items():
        vector = sig['vector']
        
        # Calcular desviación del centroide
        deviation = vector - centroid
        
        # Amplificar la desviación
        amplified_vector = centroid + (deviation * factor)
        
        # Asegurar que los valores permanezcan en rango válido [0, 1]
        amplified_vector = np.clip(amplified_vector, 0.0, 1.0)
        
        optimized[name] = {
            'data': sig['data'].copy(),
            'vector': amplified_vector
        }
        
    return optimized


def apply_pca_whitening(signatures):
    """
    Aplica PCA whitening para decorrelacionar y normalizar varianza.
    Esto hace que las diferencias sean más uniformes en todas las dimensiones.
    """
    # Extraer todos los vectores
    names = list(signatures.keys())
    vectors = np.array([signatures[name]['vector'] for name in names])
    
    # Calcular matriz de covarianza
    mean = np.mean(vectors, axis=0)
    centered = vectors - mean
    cov_matrix = np.cov(centered.T)
    
    # Eigendecomposición
    eigenvalues, eigenvectors = np.linalg.eigh(cov_matrix)
    
    # Evitar división por cero
    eigenvalues = np.maximum(eigenvalues, 1e-5)
    
    # Whitening transformation
    whitening_matrix = eigenvectors @ np.diag(1.0 / np.sqrt(eigenvalues)) @ eigenvectors.T
    
    # Aplicar transformación
    whitened_vectors = (centered @ whitening_matrix.T) + mean
    
    # Re-normalizar al rango [0, 1]
    min_vals = whitened_vectors.min(axis=0)
    max_vals = whitened_vectors.max(axis=0)
    range_vals = max_vals - min_vals
    range_vals[range_vals == 0] = 1.0  # Evitar división por cero
    
    normalized_vectors = (whitened_vectors - min_vals) / range_vals
    
    # Devolver firmas optimizadas
    optimized = {}
    for i, name in enumerate(names):
        optimized[name] = {
            'data': signatures[name]['data'].copy(),
            'vector': normalized_vectors[i]
        }
    
    return optimized


def calculate_optimal_thresholds(signatures, percentile=95):
    """
    Calcula umbrales óptimos basados en la distancia intra-clase.
    Usa el percentil 95 de las distancias al centroide propio.
    """
    thresholds = {}
    
    for name, sig in signatures.items():
        vector = sig['vector']
        
        # Simular variabilidad interna (basada en sigma original)
        original_sigma = sig['data'].get('sigma', 0.01)
        
        # Estimar umbral como 3 * sigma en el espacio euclidiano
        # Escalar por dimensionalidad
        dim = len(vector)
        estimated_threshold = 3.0 * original_sigma * np.sqrt(dim)
        
        # Ajustar basado en el factor de amplificación
        adjusted_threshold = estimated_threshold * 1.2  # Margen de seguridad
        
        thresholds[name] = adjusted_threshold
    
    return thresholds


def feature_importance_scaling(signatures):
    """
    Escala características basadas en su poder discriminativo.
    Las características con mayor varianza entre gestos se amplifican.
    """
    names = list(signatures.keys())
    vectors = np.array([signatures[name]['vector'] for name in names])
    
    # Calcular varianza entre gestos para cada característica
    between_variance = np.var(vectors, axis=0)
    
    # Calcular pesos (mayor varianza = más importante)
    weights = 1.0 + (between_variance / np.mean(between_variance))
    
    # Aplicar pesos
    optimized = {}
    for name in names:
        scaled_vector = signatures[name]['vector'] * weights
        
        # Re-normalizar
        scaled_vector = scaled_vector / np.max(scaled_vector)
        
        optimized[name] = {
            'data': signatures[name]['data'].copy(),
            'vector': scaled_vector
        }
    
    return optimized


def save_optimized_signatures(signatures, thresholds, output_dir):
    """Guarda las firmas optimizadas en archivos JSON"""
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    for name, sig in signatures.items():
        data = sig['data']
        
        # Actualizar firma
        data['firma_promedio'] = sig['vector'].tolist()
        
        # Actualizar umbral
        if name in thresholds:
            data['umbral'] = float(thresholds[name])
        
        # Agregar metadata de optimización
        if 'metadata' not in data:
            data['metadata'] = {}
        
        data['metadata']['optimizado'] = True
        data['metadata']['fecha_optimizacion'] = "2025-12-29"
        data['metadata']['tecnicas'] = []
        
        if APPLY_PCA_WHITENING:
            data['metadata']['tecnicas'].append('PCA_whitening')
        if APPLY_FEATURE_SCALING:
            data['metadata']['tecnicas'].append('feature_importance_scaling')
        if AMPLIFICATION_FACTOR != 1.0:
            data['metadata']['tecnicas'].append(f'amplification_{AMPLIFICATION_FACTOR}x')
        
        # Guardar
        output_path = Path(output_dir) / f"{name}.json"
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Guardado: {name}.json (umbral: {data['umbral']:.4f})")


def analyze_separability(signatures):
    """Analiza la separabilidad entre gestos"""
    names = list(signatures.keys())
    vectors = np.array([signatures[name]['vector'] for name in names])
    
    print("\n" + "="*60)
    print("📊 ANÁLISIS DE SEPARABILIDAD")
    print("="*60)
    
    # Matriz de distancias
    print("\n🔍 Distancias entre gestos (Euclidianas):")
    print("-" * 60)
    
    for i, name1 in enumerate(names):
        for j, name2 in enumerate(names):
            if i < j:
                dist = np.linalg.norm(vectors[i] - vectors[j])
                print(f"  {name1} ↔ {name2}: {dist:.4f}")
    
    # Estadísticas generales
    all_distances = []
    for i in range(len(vectors)):
        for j in range(i+1, len(vectors)):
            all_distances.append(np.linalg.norm(vectors[i] - vectors[j]))
    
    print("\n📈 Estadísticas:")
    print("-" * 60)
    print(f"  Distancia mínima: {np.min(all_distances):.4f}")
    print(f"  Distancia promedio: {np.mean(all_distances):.4f}")
    print(f"  Distancia máxima: {np.max(all_distances):.4f}")
    print(f"  Desviación estándar: {np.std(all_distances):.4f}")
    
    # Recomendación
    min_dist = np.min(all_distances)
    if min_dist < 0.15:
        print(f"\n⚠️  ADVERTENCIA: Distancia mínima muy baja ({min_dist:.4f})")
        print("   Recomendación: Aumentar AMPLIFICATION_FACTOR o regenerar firmas")
    elif min_dist < 0.25:
        print(f"\n⚡ Separabilidad moderada ({min_dist:.4f})")
        print("   Sistema funcionará con consenso temporal")
    else:
        print(f"\n✅ Excelente separabilidad ({min_dist:.4f})")
        print("   Sistema debería funcionar perfectamente")


# ================== PROCESO PRINCIPAL ==================

def main():
    print("🚀 OPTIMIZADOR DE FIRMAS DE GESTOS")
    print("=" * 60)
    
    # 1. Cargar firmas originales
    print(f"\n📂 Cargando firmas desde: {INPUT_DIR}")
    signatures = load_signatures(INPUT_DIR)
    print(f"   ✅ Cargadas {len(signatures)} firmas: {', '.join(signatures.keys())}")
    
    # Análisis inicial
    print("\n📊 ESTADO INICIAL:")
    analyze_separability(signatures)
    
    # 2. Aplicar optimizaciones
    print("\n⚙️  APLICANDO OPTIMIZACIONES:")
    print("-" * 60)
    
    optimized = signatures
    
    if APPLY_FEATURE_SCALING:
        print("  🔧 Aplicando escalado por importancia de características...")
        optimized = feature_importance_scaling(optimized)
    
    if AMPLIFICATION_FACTOR != 1.0:
        print(f"  🔧 Amplificando diferencias (factor {AMPLIFICATION_FACTOR}x)...")
        centroid = compute_centroid(optimized)
        optimized = amplify_differences(optimized, centroid, AMPLIFICATION_FACTOR)
    
    if APPLY_PCA_WHITENING:
        print("  🔧 Aplicando PCA whitening...")
        optimized = apply_pca_whitening(optimized)
    
    # 3. Calcular nuevos umbrales
    thresholds = {}
    if ADJUST_THRESHOLDS:
        print("  🔧 Recalculando umbrales óptimos...")
        thresholds = calculate_optimal_thresholds(optimized)
    
    # Análisis final
    print("\n📊 ESTADO OPTIMIZADO:")
    analyze_separability(optimized)
    
    # 4. Guardar resultados
    print(f"\n💾 Guardando firmas optimizadas en: {OUTPUT_DIR}")
    print("-" * 60)
    save_optimized_signatures(optimized, thresholds, OUTPUT_DIR)
    
    print("\n" + "="*60)
    print("✅ OPTIMIZACIÓN COMPLETADA")
    print("="*60)
    print(f"\n📁 Archivos generados en: {OUTPUT_DIR}")
    print("\n🔄 Próximos pasos:")
    print("  1. Revisa los archivos en gestures_optimized/")
    print("  2. Si la separabilidad mejoró, reemplaza los originales:")
    print("     - Haz backup de wwwroot/gestures/")
    print("     - Copia los archivos de gestures_optimized/ a gestures/")
    print("  3. Reinicia tu aplicación y prueba")


if __name__ == "__main__":
    main()