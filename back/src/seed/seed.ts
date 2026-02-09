import { User, Book, Loan } from "../models";
// Importamos los modelos User, Book y Loan para poder crear registros en la base de datos



// Helper para crear fechas relativas al día de hoy
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
const daysFromNow = (d: number) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);



const buildLoanSeedData = (users: any[], books: any[]) => [
    // --- Préstamos ACTIVOS (sin fechaDevolucionReal, fecha límite futura) ---
    {
        usuarioId: users[0].id,
        libroId: books[0].id,
        fechaPrestamo: daysAgo(3),
        fechaDevolucionPrevista: daysFromNow(11),
        fechaDevolucionReal: null,
    },
    {
        usuarioId: users[1].id,
        libroId: books[3].id,
        fechaPrestamo: daysAgo(5),
        fechaDevolucionPrevista: daysFromNow(9),
        fechaDevolucionReal: null,
    },
    {
        usuarioId: users[2].id,
        libroId: books[6].id,
        fechaPrestamo: daysAgo(2),
        fechaDevolucionPrevista: daysFromNow(12),
        fechaDevolucionReal: null,
    },
    {
        usuarioId: users[4].id,
        libroId: books[10].id,
        fechaPrestamo: daysAgo(1),
        fechaDevolucionPrevista: daysFromNow(13),
        fechaDevolucionReal: null,
    },
    {
        usuarioId: users[6].id,
        libroId: books[13].id,
        fechaPrestamo: daysAgo(4),
        fechaDevolucionPrevista: daysFromNow(10),
        fechaDevolucionReal: null,
    },

    // --- Préstamos ACTIVOS a punto de vencer (< 3 días) ---
    {
        usuarioId: users[3].id,
        libroId: books[1].id,
        fechaPrestamo: daysAgo(12),
        fechaDevolucionPrevista: daysFromNow(1),
        fechaDevolucionReal: null,
    },
    {
        usuarioId: users[7].id,
        libroId: books[7].id,
        fechaPrestamo: daysAgo(10),
        fechaDevolucionPrevista: daysFromNow(2),
        fechaDevolucionReal: null,
    },

    // --- Préstamos VENCIDOS (sin fechaDevolucionReal, fecha límite pasada) ---
    {
        usuarioId: users[5].id,
        libroId: books[4].id,
        fechaPrestamo: daysAgo(20),
        fechaDevolucionPrevista: daysAgo(6),
        fechaDevolucionReal: null,
    },
    {
        usuarioId: users[9].id,
        libroId: books[8].id,
        fechaPrestamo: daysAgo(30),
        fechaDevolucionPrevista: daysAgo(16),
        fechaDevolucionReal: null,
    },
    {
        usuarioId: users[0].id,
        libroId: books[11].id,
        fechaPrestamo: daysAgo(25),
        fechaDevolucionPrevista: daysAgo(11),
        fechaDevolucionReal: null,
    },

    // --- Préstamos DEVUELTOS a tiempo ---
    {
        usuarioId: users[1].id,
        libroId: books[2].id,
        fechaPrestamo: daysAgo(30),
        fechaDevolucionPrevista: daysAgo(16),
        fechaDevolucionReal: daysAgo(18),
    },
    {
        usuarioId: users[2].id,
        libroId: books[5].id,
        fechaPrestamo: daysAgo(45),
        fechaDevolucionPrevista: daysAgo(31),
        fechaDevolucionReal: daysAgo(35),
    },
    {
        usuarioId: users[3].id,
        libroId: books[9].id,
        fechaPrestamo: daysAgo(60),
        fechaDevolucionPrevista: daysAgo(46),
        fechaDevolucionReal: daysAgo(50),
    },
    {
        usuarioId: users[4].id,
        libroId: books[14].id,
        fechaPrestamo: daysAgo(20),
        fechaDevolucionPrevista: daysAgo(6),
        fechaDevolucionReal: daysAgo(8),
    },
    {
        usuarioId: users[6].id,
        libroId: books[0].id,
        fechaPrestamo: daysAgo(50),
        fechaDevolucionPrevista: daysAgo(36),
        fechaDevolucionReal: daysAgo(40),
    },

    // --- Préstamos DEVUELTOS CON RETRASO ---
    {
        usuarioId: users[5].id,
        libroId: books[12].id,
        fechaPrestamo: daysAgo(40),
        fechaDevolucionPrevista: daysAgo(26),
        fechaDevolucionReal: daysAgo(22),
    },
    {
        usuarioId: users[7].id,
        libroId: books[3].id,
        fechaPrestamo: daysAgo(35),
        fechaDevolucionPrevista: daysAgo(21),
        fechaDevolucionReal: daysAgo(15),
    },
    {
        usuarioId: users[8].id,
        libroId: books[1].id,
        fechaPrestamo: daysAgo(55),
        fechaDevolucionPrevista: daysAgo(41),
        fechaDevolucionReal: daysAgo(38),
    },
    {
        usuarioId: users[9].id,
        libroId: books[6].id,
        fechaPrestamo: daysAgo(28),
        fechaDevolucionPrevista: daysAgo(14),
        fechaDevolucionReal: daysAgo(10),
    },
    {
        usuarioId: users[0].id,
        libroId: books[7].id,
        fechaPrestamo: daysAgo(22),
        fechaDevolucionPrevista: daysAgo(8),
        fechaDevolucionReal: daysAgo(5),
    },

    // --- Más préstamos variados para mayor volumen ---
    {
        usuarioId: users[1].id,
        libroId: books[9].id,
        fechaPrestamo: daysAgo(7),
        fechaDevolucionPrevista: daysFromNow(7),
        fechaDevolucionReal: null,
    },
    {
        usuarioId: users[8].id,
        libroId: books[5].id,
        fechaPrestamo: daysAgo(15),
        fechaDevolucionPrevista: daysAgo(1),
        fechaDevolucionReal: null,
    },
    {
        usuarioId: users[3].id,
        libroId: books[12].id,
        fechaPrestamo: daysAgo(10),
        fechaDevolucionPrevista: daysAgo(3),
        fechaDevolucionReal: daysAgo(2),
    },
    {
        usuarioId: users[6].id,
        libroId: books[14].id,
        fechaPrestamo: daysAgo(18),
        fechaDevolucionPrevista: daysAgo(4),
        fechaDevolucionReal: daysAgo(6),
    },
    {
        usuarioId: users[4].id,
        libroId: books[2].id,
        fechaPrestamo: daysAgo(6),
        fechaDevolucionPrevista: daysFromNow(8),
        fechaDevolucionReal: null,
    },
];



export const runLoanSeed = async () => {
    const users = await User.findAll({ order: [["id", "ASC"]] });
    const books = await Book.findAll({ order: [["id", "ASC"]] });

    if (users.length < 10 || books.length < 15) {
        console.log("No hay suficientes usuarios/libros para sembrar préstamos.");
        return;
    }

    const loans = buildLoanSeedData(users, books);
    await Loan.bulkCreate(loans);
    console.log(`Seed de préstamos completado: ${loans.length} préstamos creados.`);
};



export const runSeed = async () => {
    // Función que ejecuta el seed inicial de la base de datos

    console.log("Ejecutando seed...");
    // Mensaje para indicar que el proceso de seed ha comenzado



    const users = await User.bulkCreate([
        // Creamos varios usuarios de ejemplo en un solo paso

        { nombre: "Juan Perez", email: "juan@example.com", activo: true },
        // Primer usuario activo

        { nombre: "Ana Lopez", email: "ana@example.com", activo: true },
        // Segundo usuario activo

        { nombre: "Carlos Garcia", email: "carlos@example.com", activo: true },
        { nombre: "Maria Torres", email: "maria@example.com", activo: true },
        { nombre: "Pedro Sanchez", email: "pedro@example.com", activo: true },
        { nombre: "Laura Martinez", email: "laura@example.com", activo: true },
        { nombre: "Diego Fernandez", email: "diego@example.com", activo: true },
        { nombre: "Sofia Ramirez", email: "sofia@example.com", activo: true },
        { nombre: "Andres Morales", email: "andres@example.com", activo: false },
        { nombre: "Lucia Herrera", email: "lucia@example.com", activo: true },
    ]);



    const books = await Book.bulkCreate([
        // Creamos varios libros de ejemplo en un solo paso

        { titulo: "1984", autor: "George Orwell", stock: 5 },
        { titulo: "El Quijote", autor: "Miguel de Cervantes", stock: 4 },
        { titulo: "Cien anos de soledad", autor: "Gabriel Garcia Marquez", stock: 3 },
        { titulo: "El Principito", autor: "Antoine de Saint-Exupery", stock: 6 },
        { titulo: "Don Juan Tenorio", autor: "Jose Zorrilla", stock: 2 },
        { titulo: "La sombra del viento", autor: "Carlos Ruiz Zafon", stock: 4 },
        { titulo: "Rayuela", autor: "Julio Cortazar", stock: 3 },
        { titulo: "La casa de los espiritus", autor: "Isabel Allende", stock: 5 },
        { titulo: "Ficciones", autor: "Jorge Luis Borges", stock: 2 },
        { titulo: "Crimen y castigo", autor: "Fiodor Dostoyevski", stock: 3 },
        { titulo: "El amor en los tiempos del colera", autor: "Gabriel Garcia Marquez", stock: 4 },
        { titulo: "Pedro Paramo", autor: "Juan Rulfo", stock: 3 },
        { titulo: "Los detectives salvajes", autor: "Roberto Bolano", stock: 2 },
        { titulo: "Fahrenheit 451", autor: "Ray Bradbury", stock: 5 },
        { titulo: "Orgullo y prejuicio", autor: "Jane Austen", stock: 4 },
    ]);



    const loans = buildLoanSeedData(users, books);
    await Loan.bulkCreate(loans);

    console.log("Seed completado: 10 usuarios, 15 libros, 25 préstamos creados.");
    // Mensaje indicando que el proceso de seed terminó correctamente
};
