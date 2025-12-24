using OpenCvSharp;
using TraductorDeSignos.Models;

namespace TraductorDeSignos.Interfaces
{

    /*
    
    Es la interfaz que define cómo detectamos o clasificamos un gesto a partir de los landmarks recibidos (los keypoints de MediaPipe).

    Qué hace:

    Recibe un array de coordenadas (double[] keypoints) de la mano o manos.

    Devuelve un DetectionResult con:

    Si se detectó un gesto (Detected)

    Qué gesto fue (GestureName)

    Nivel de similitud (Similarity)

    Umbral usado (Threshold)

    Por qué existe:

    Separar la lógica de reconocimiento de la gestión de patrones.

    Permite que el Hub o el frontend solo llame a este servicio y reciba un resultado limpio.

    Facilita pruebas unitarias: puedes pasar keypoints simulados y ver qué detecta.

    En pocas palabras:

    “Yo recibo los puntos de la mano y digo qué gesto es.”
     
     */


    public interface IGestureDetectorService
    {

        //Procesa un frame de keypoints y determina si corresponde a algún gesto conocido. Array de coordenadas (x,y,z) de 21 o 42 landmarks.
        Task<DetectionResult?> ProcessFrame(double[] keypoints);
    }

  // CameraHub (keypoints crudos) - IGestureDetectorService - IGestureSignatureService - DetectionResult


}
