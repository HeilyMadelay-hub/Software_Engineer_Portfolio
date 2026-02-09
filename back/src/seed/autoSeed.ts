import { User, Book, Loan } from "../models/index";//Importamos los modelos User y Book para poder consultar la base de datos

import { runSeed, runLoanSeed } from "./seed";//Importamos la función que ejecuta el seed inicial con datos de ejemplo



export const runSeedIfEmpty = async () => {//Función que ejecuta el seed solo si la base de datos está vacía

 const userCount = await User.count();//Contamos cuántos usuarios existen actualmente en la base de datos

 const bookCount = await Book.count();//Contamos cuántos libros existen actualmente en la base de datos

 const loanCount = await Loan.count();

 if (userCount ===0 && bookCount ===0) {//Si no hay usuarios ni libros, significa que la base está vacía

 console.log("Base vacía. Ejecutando seed automático...");//Mensaje indicando que se ejecutará el seed

 await runSeed();//Ejecutamos el seed para poblar la base con datos iniciales

 } else if (loanCount ===0) {
 console.log("No hay préstamos. Ejecutando seed de préstamos...");
 await runLoanSeed();
 } else {
 // Si ya existen datos, no ejecutamos el seed

 console.log("La base ya tiene datos. Seed no ejecutado.");// Mensaje indicando que no se realizará ninguna acción
 }
};
