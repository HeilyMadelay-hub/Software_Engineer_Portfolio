namespace TraductorDeSignos.Models
{

    // Estos modelos representan entidades del dominio interno del sistema.
    // No son DTOs de API ni objetos de transporte HTTP.
    // Viven en la capa Core/Domain/Models porque el núcleo del sistema
    // opera sobre conceptos de dominio (gestos y firmas matemáticas),
    // no sobre formatos de persistencia.
    // El JSON se utiliza únicamente como mecanismo de almacenamiento,
    // pero nunca se propaga al núcleo lógico del sistema.

    //Separé la decisión (DetectionResult), el conocimiento (GestureSignature)
    //y el contexto (GestureMetadata) para mantener un dominio claro, explicable y extensible, independiente de la infraestructura y del modelo usado.

    //Decision en tiempo real.Se encarga de la salida final hacia el resto
    public class DetectionResult
    {
        public bool Detected { get; }//Para indicar si se ha detectado o no y hacer una decision

        public string GestureName { get; } // Nombre del gesto detectado en tiempo real, flexible para gestos dinámicos y versiones

        public double Similarity { get; }//La confianza matemática real de la detección para saber que tanto ha acertado
        public double Threshold { get; }//Porque se detecto o no un gesto

        public DetectionResult(
            bool detected,
            string gestureName,
            double similarity,
            double threshold)
        {
            Detected = detected;
            GestureName = gestureName;
            Similarity = similarity;
            Threshold = threshold;
        }

        //Caso:"El sistema evaluo pero no detecto gesto"
        public static DetectionResult NoDetection()
            => new(false, string.Empty, 0.0, 0.0);
    }
}
