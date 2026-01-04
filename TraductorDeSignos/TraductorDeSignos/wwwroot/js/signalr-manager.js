// Responsabilidad:
// 1. Establecer y mantener una ÚNICA conexión SignalR para toda la aplicación.
// 2. Recibir eventos del servidor (Hub) y re-transmitirlos como eventos de JS nativos (CustomEvent).
// 3. Exponer una API global para que otros scripts puedan enviar datos al servidor.

(function () {
    // Crear conexión SignalR
    const connection = new signalR.HubConnectionBuilder()
        .withUrl("/cameraHub")
        .withAutomaticReconnect()
        .build();

    // Función para iniciar la conexión
    async function startConnection() {
        try {
            await connection.start();
            console.log("? SignalR Manager: Conectado.");
            // Disparar un evento para notificar que la conexión está lista
            window.dispatchEvent(new CustomEvent('signalrConnected'));
        } catch (err) {
            console.error("? SignalR Manager: Error de conexión:", err);
            setTimeout(startConnection, 5000); // Reintentar en 5 segundos
        }
    }

    // Escuchar eventos de gestos desde el Hub
    connection.on("GestureDetected", (result) => {
        console.log("?? SignalR Manager: Evento 'GestureDetected' recibido:", result);

        // Emitir evento personalizado para que otros módulos (statistics.js, detector.js) lo escuchen
        const eventoGesto = new CustomEvent('gestureDetected', {
            detail: {
                gestureName: result.gestureName || result.nombre || 'desconocido',
                similarity: result.similarity || result.confianza || 0,
                distance: result.distance || result.distancia || 0,
                threshold: result.threshold || result.umbral || 0.8,
                state: result.state,
                isClear: result.isClearGesture,
                timestamp: new Date()
            }
        });
        window.dispatchEvent(eventoGesto);
    });

    // Manejo de ciclo de vida de la conexión
    connection.onreconnecting((error) => {
        console.warn("?? SignalR Manager: Reconectando...", error);
        window.dispatchEvent(new CustomEvent('signalrReconnecting'));
    });

    connection.onreconnected((connectionId) => {
        console.log("? SignalR Manager: Reconectado:", connectionId);
        window.dispatchEvent(new CustomEvent('signalrReconnected'));
    });

    connection.onclose((error) => {
        console.error("? SignalR Manager: Desconectado.", error);
        window.dispatchEvent(new CustomEvent('signalrDisconnected'));
    });

    // Iniciar la conexión al cargar el script
    startConnection();

    // Exponer una API global para enviar datos
    window.signalRManager = {
        sendKeypoints: (keypoints) => {
            if (connection.state === signalR.HubConnectionState.Connected) {
                connection.invoke("ReceiveKeypoints", keypoints).catch(err => console.error("Error al enviar keypoints:", err));
            } else {
                console.warn("SignalR no conectado. No se pueden enviar keypoints.");
            }
        },
        getConnection: () => connection
    };

})();
