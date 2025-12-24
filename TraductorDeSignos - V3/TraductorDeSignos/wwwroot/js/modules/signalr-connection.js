// Este archivo es la capa de comunicación con el backend.
// Se encarga únicamente de enviar y recibir datos en tiempo real mediante SignalR.
//
// Es el segundo archivo del flujo porque:
// 1) MediaPipe se encarga de capturar y procesar los datos (keypoints).
// 2) Aquí se envían esos datos al backend.
// 3) CameraHub es quien los recibe para aplicar la lógica.
//
// Separarlo así evita acoplar MediaPipe con la red y permite cambiar
// el sistema de tracking o el transporte sin tocar el backend.
// También evita la necesidad de un microservicio externo (por ejemplo en Python).

// Conexión SignalR con el backend
// SignalR gestiona automáticamente el transporte y la reconexión
export const connection = new signalR.HubConnectionBuilder()
    .withUrl("/cameraHub")
    .withAutomaticReconnect()
    .build();

//Para ver si tiene que iniciarlo es asincrona porque
//connection start realiza una operacion de red no es instantanea
export async function startSignalR() {
    if (connection.state === signalR.HubConnectionState.Disconnected) {//Verifica que la conexion no este ya activa para asi evitar reconectarlo varias veces

        try {
            await connection.start();//abre la conexion  del servidor signalr con await asegurando que este lista antes de continuar
        // connection.start() inicia la conexión con SignalR.
        // Internamente, SignalR negocia con el servidor el transporte de comunicación
        // (normalmente WebSockets) y elige automáticamente el mejor mecanismo disponible
        // entre navegador y servidor.
            console.log(" SignalR conectado");
        } catch (err) {
            console.error("Error conectando SignalR:", err);
            // Intentar reconectar en 5s
            setTimeout(startSignalR, 5000);
        }
    }
}

// Envia SOLO los keypoints (números) al backend no se envia imagenes ni datos pesados lo que reduce la latencia y el consumo de red
export async function sendKeypoints(keypoints) {
    if (connection.state !== signalR.HubConnectionState.Connected) return;

    try {
        await connection.invoke("ReceiveKeypoints", keypoints);
    } catch (err) {
        console.error("Error enviando keypoints, reintentando:", err);
        setTimeout(() => sendKeypoints(keypoints), 100);
    }
}


//Esto hay que meterlo en la funcion de cuando se dibuje los puntos para que
//al mismo tiempo que detecte envie al back para comparar el gesto enviando solo datos srializables