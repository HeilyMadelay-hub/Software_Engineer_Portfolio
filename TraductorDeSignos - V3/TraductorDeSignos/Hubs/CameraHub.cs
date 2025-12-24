using Microsoft.AspNetCore.SignalR;
using TraductorDeSignos.Interfaces;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace TraductorDeSignos.Hubs
{
    public class CameraHub : Hub
    {

        //CameraHub NO calcula nada, NO clasifica, NO decide.No debe normalizar,construir buffers,implementar algoritmos
        //Solo recibe datos y los pasa al Core al GestureDetectorService que es el que tiene el serivicio con el algoritmo mates

        //Funcion:JS → CameraHub → Service → resultado → CameraHub → JS

        // Las interfaces influyen aquí:
        // 1 IGestureDetectorService define qué métodos CameraHub puede llamar.
        // 2️ CameraHub no necesita saber cómo funciona el algoritmo, solo llama a ProcessFrameAsync() definido en la interfaz.
        // 3️ Esto permite desacoplar Hub del Core: se puede cambiar la implementación del detector sin tocar CameraHub.

        private readonly IGestureDetectorService _gestureDetectorService;
        // Inyectamos la interfaz, no la implementación concreta, porque queremos depender
        // de abstracciones (principio de inversión de dependencias) y no de detalles concretos.
        // Esto permite un código más limpio, flexible y fácil de mantener.


        public CameraHub(IGestureDetectorService gestureDetectorService)
        {
            _gestureDetectorService = gestureDetectorService;
        }


        public async Task ReceiveKeypoints(double[] keypoints)// deben ser double porque number equivale a esto entre "" ,es decir respeta que lo serializa por defecto
        {
            //Validacion del minimo estructural que no tiene que coincidir con la dimesion del JSON porque son distintas etapas del pipeline (flujo completo de procesamiento que sigue un dato desde que entra al sistema hasta que sale, pasando por etapas bien separadas y con responsabilidades claras.)

            //Desde JS estamos recibiendo 21 landmarks cada landmark con x,y,z ,21 × 3 = 63. Hasta 2 manos ,42 × 3 = 126.Aun no asumimos nada del gesto porque esa es responsabilidad del servicio donde sucede la reduccion dimensional y la conversion a firmas dinamicas.Hub son datos crudos
            if (keypoints == null || keypoints.Length % 3 != 0)
                return;

            if (keypoints.Length != 63 && keypoints.Length != 126)
                return;

            //Console.WriteLine($"Keypoints recibidos: {keypoints.Length}"); Comprobacion para ver si los pillaba

            //Llamado al servicio para delegar el resultado
            var result = await _gestureDetectorService.ProcessFrame(keypoints);

            // Si no hay gesto, no se devuelve nada
            if (result == null)
                return;

            // Devolver SOLO el resultado semántico al cliente
            await Clients.Caller.SendAsync("GestureDetected", result);


        }

    }
}