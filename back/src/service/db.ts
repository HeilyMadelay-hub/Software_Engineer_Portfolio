const { Sequelize } = require("sequelize");//Esta librearia esta configurada para trabajar con una base de datos SQLite en Node.js

//Esto el el ORM que actua como traductor entre el código y la base de datos
const sequelize = new Sequelize({
    dialect: "sqlite",//Base de datos que utilizará
    storage: "./biblioteca.sqlite",//Donde se guardara la base de datos, es decir, el archivo de la base de datos
    logging: true//Para mostrar por consola las consultas SQL que sequelize ejecuta
});

module.exports = sequelize;