import axios from 'axios';//Importa la librería Axios que instalamos con npm install axios recuerda que es para la conexion http

/**
 * Instancia configurada de Axios para comunicarse con el backend
 * Todas las peticiones usan esta configuración base
 
  const api = axios.create({
    baseURL: 'http://localhost:4000', // URL del backend Node.js.Cuando hagas api.get('/books'), realmente llamará a http://localhost:4000/books
    headers: {
      'Content-Type': 'application/json',//Le dice al servidor que estás enviando/esperando datos en formato JSON
    },
    timeout: 10000, // 10 segundos de timeout
  });

  Esto tambien para un principio dejarlo listo,pero si luego quieres dejarlo asi de verdad tendrias que instalar el cors para que desde el puerto del front dentro use este 
  por eso la configuracion la haremos en el config vite

*/

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // En producción usa la URL completa, en dev usa el proxy de Vite
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Interceptor para manejar errores globalmente
 * intercepta todas las llamadas de la api antes de que llegue al codigo
 */
api.interceptors.response.use(

  (response) => { // funcion para si la petición es exitosa, devuélvela tal cual
    console.log(' Petición exitosa:', response.data);
    return response;  // Siempre debe devolverla
    },

  (error) => {//para el manejo básico de errores
    if (error.response) {
      // El servidor respondió con un status code fuera del rango 2xx
      console.error('Error de respuesta:', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      console.error('No hay respuesta del servidor:', error.request);
    } else {
      // Algo pasó al configurar la petición
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
    // Propaga el error para que el código que hizo la petición pueda manejarlo en su catch.
    // Sin esto, el error quedaría atrapado en el interceptor y el catch del componente no se ejecutaría.

    // Alternativa (NO recomendada): Devolver valor por defecto
    // return { data: [] };  
    // Esto ocultaría el error y devolvería un array vacío, 
    // lo cual es problemático porque el componente no sabría que algo falló.
    
  }
);

// No es obligatorio, es opcional. Si no lo usas, debes manejar el error 
// en cada llamada con try/catch.
// Con el interceptor, centralizas el manejo de errores (logs, notificaciones),
// pero aún necesitas try/catch in cada componente para la lógica específica.
// El interceptor maneja errores HTTP globalmente, pero no reemplaza 
// el manejo de errores de negocio en tus componentes.

export default api;//exporta la instacia para que otros archivos puedan importarlo