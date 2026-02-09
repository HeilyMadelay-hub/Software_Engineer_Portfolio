import { User, Book, Loan } from "../models";//Importamos los modelos User y Book para poder consultar la base de datos

import { runSeed, runLoanSeed } from "./seed";//Importamos la funcin que ejecuta el seed inicial con datos de ejemplo



export const runSeedIfEmpty = async () => {//Funcin que ejecuta el seed solo si la base de datos est vaca

    const userCount = await User.count();//Contamos cuntos usuarios existen actualmente en la base de datos

    const bookCount = await Book.count();//Contamos cuntos libros existen actualmente en la base de datos

    const loanCount = await Loan.count();

    if (userCount === 0 && bookCount === 0) {//Si no hay usuarios ni libros, significa que la base est vaca

        console.log("Base vaca. Ejecutando seed automtico...");//Mensaje indicando que se ejecutar el seed

        await runSeed();//Ejecutamos el seed para poblar la base con datos iniciales

    } else if (loanCount === 0) {
        console.log("No hay prstamos. Ejecutando seed de prstamos...");
        await runLoanSeed();
    } else {
        // Si ya existen datos, no ejecutamos el seed

        console.log("La base ya tiene datos. Seed no ejecutado.");// Mensaje indicando que no se realizar ninguna accin
    }
};
