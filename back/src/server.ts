require("dotenv").config();// Carga las variables de entorno desde el archivo .env

const express = require("express");//Importa el servidor Express para manejar rutas y peticiones HTTP
const cors = require("cors");//Importa el middleware CORS para permitir peticiones de otros orígenes
const sequelize = require('./service/db');//Importamos la conexión configurada a nuestra base de datos SQLite

import { Book, User, Loan } from "./models";//Importamos los modelos y sus relaciones para que Sequelize los registre
import swaggerUi from "swagger-ui-express";//Importa Swagger UI para mostrar la documentación en una interfaz web
import swaggerJsdoc from "swagger-jsdoc";//Genera la especificación OpenAPI a partir de opciones y comentarios
import { swaggerOptions } from "./swagger/swagger";//Importa la configuración de Swagger (título, versión, rutas, etc.)
import { runSeedIfEmpty } from "./seed/autoSeed";//Función que inserta datos iniciales si la base de datos está vacía
import userRoutes from "./routes/userRoutes";//Importa las rutas relacionadas con usuarios
import bookRoutes from "./routes/bookRoutes";//Importa las rutas relacionadas con libros
import loanRoutes from "./routes/loanRoutes";//Importa las rutas relacionadas con préstamos



const app = express();//Inicializa el servidor Express

const swaggerSpec = swaggerJsdoc(swaggerOptions);//Genera la documentación Swagger a partir de las opciones configuradas

app.use(cors()); // Habilita CORS para peticiones desde otros orígenes (producción)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));//Habilita la ruta /api-docs para visualizar la documentación de la API

app.use(express.json());//Permite que Express reciba y procese JSON en las peticiones



app.use("/api/books", bookRoutes);//Registra las rutas de libros bajo el prefijo /api/books
app.use("/api/users", userRoutes);//Registra las rutas de usuarios bajo el prefijo /api/users
app.use("/api/loans", loanRoutes);//Registra las rutas de préstamos bajo el prefijo /api/loans



const PORT = process.env.port || 4000;//Define el puerto del servidor, usando .env o 4000 por defecto



const start = async () => {//Función principal que inicia la aplicación

    try {
        await sequelize.authenticate();//Verifica la conexión con la base de datos
        console.log("Conexión a SQLite OK");//Mensaje de confirmación en consola

        await sequelize.sync({ alter: true });//Sincroniza los modelos con la base de datos (crea o actualiza tablas)
        await runSeedIfEmpty();//Inserta datos iniciales si la base está vacía
        console.log("Modelos sincronizados");//Confirma que las tablas están listas

        app.listen(PORT, () => {
            //Inicia el servidor en el puerto definido

            console.log(`Servidor corriendo en el puerto ${PORT} `);//Mensaje indicando que el servidor está activo
        });

    } catch (error) {
        console.error("Error iniciando la app:", error);//Muestra un mensaje si ocurre un error al iniciar
        process.exit(1);//Finaliza la ejecución de la aplicación
    }
};



start();//Ejecuta la función principal para iniciar el servidor
