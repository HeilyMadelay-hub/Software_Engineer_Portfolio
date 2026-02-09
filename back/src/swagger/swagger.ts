import swaggerJsdoc from "swagger-jsdoc";
// Importa la librería que genera la especificación OpenAPI a partir de opciones y anotaciones



export const swaggerOptions = {// Exportamos la configuración que usará Swagger para generar la documentación

    definition: {// Define la estructura base de la especificación OpenAPI
        openapi: "3.0.0",// Versión del estándar OpenAPI que estamos utilizando
        info: {// Información general de la API que aparecerá en la documentación
            title: "API Biblioteca", // Título visible en Swagger UI
            version: "1.0.0", // Versión de la API
            description: "API para gestionar usuarios, libros y préstamos",// Breve descripción de lo que ofrece la API
        },
        servers: [// Lista de servidores donde se puede consumir la API
            {
                url: "http://localhost:4000",// URL base del servidor local donde corre la API
                description: "Servidor local",// Descripción del servidor
            },
        ],
    },

    apis: ["./src/routes/*.ts"],// Indica a Swagger dónde buscar anotaciones para generar la documentación
    // En este caso, todas las rutas escritas en TypeScript dentro de /src/routes
};
