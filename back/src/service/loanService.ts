import { Book, Loan, User } from "../models/index";
// Importamos los modelos Book, Loan y User para trabajar con la base de datos



// Método que crea un préstamo nuevo
export const createLoan = async (data: {
 usuarioId: number;
 libroId: number;
 diasPrestamo: number;
}) => {
 // Desestructuramos los datos recibidos del cuerpo de la petición
 const { usuarioId, libroId, diasPrestamo } = data;

 // Buscamos al usuario que realiza el préstamo
 const usuario = await User.findByPk(usuarioId);
 // Si el usuario no existe o está inactivo, lanzamos un error
 if (!usuario || !usuario.getDataValue("activo")) {
 throw new Error("Usuario no válido o inactivo");
 }

 // Buscamos el libro que se quiere prestar
 const libro = await Book.findByPk(libroId);
 // Si el libro no existe, lanzamos un error
 if (!libro) throw new Error("Libro no encontrado");

 // Obtenemos el stock actual del libro
 const stock = libro.getDataValue("stock");
 // Si no hay ejemplares disponibles, no permitimos el préstamo
 if (stock <=0) {
 throw new Error("No hay ejemplares disponibles");
 }

 // Calculamos la fecha de inicio del préstamo (fecha actual)
 const fechaPrestamo = new Date();
 // Inicializamos la fecha prevista de devolución
 const fechaDevolucionPrevista = new Date();
 // Sumamos los días de préstamo a la fecha actual para calcular la devolución prevista
 fechaDevolucionPrevista.setDate(fechaPrestamo.getDate() + diasPrestamo);

 // Creamos el registro del préstamo en la base de datos
 const prestamo = await Loan.create({
 usuarioId,
 libroId,
 fechaPrestamo,
 fechaDevolucionPrevista,
 });

 // Actualizamos el stock del libro restando una unidad
 await libro.update({ stock: stock -1 });

 // Devolvemos el préstamo creado
 return prestamo;
};



// Método que devuelve todos los préstamos
export const getLoans = async () => {
 // Busca todos los préstamos incluyendo la información del usuario y del libro asociado
 return Loan.findAll({ include: [{ model: User, as: "usuario" }, { model: Book, as: "libro" }] });
};



// Método que devuelve un préstamo concreto por su id
export const getLoanById = async (id: number) => {
 // Busca un préstamo por su clave primaria e incluye usuario y libro relacionados
 return Loan.findByPk(id, { include: [{ model: User, as: "usuario" }, { model: Book, as: "libro" }] });
};



// Método que permite actualizar un préstamo
export const updateLoan = async (
 id: number,
 data: Partial<{ fechaDevolucionPrevista: Date; fechaDevolucionReal: Date }>
) => {
 // Buscamos el préstamo por su id
 const loan = await Loan.findByPk(id);
 // Si no existe, lanzamos un error
 if (!loan) throw new Error("Préstamo no encontrado");

 // Actualizamos los campos permitidos con los datos recibidos
 await loan.update(data);
 // Devolvemos el préstamo ya actualizado
 return loan;
};



// Método que permite borrar un préstamo
export const deleteLoan = async (id: number) => {
 // Buscamos el préstamo por su id
 const loan = await Loan.findByPk(id);
 // Si no existe, lanzamos un error
 if (!loan) throw new Error("Préstamo no encontrado");

 // Si el préstamo aún no fue devuelto, debemos devolver el ejemplar al stock
 if (!loan.getDataValue("fechaDevolucionReal")) {
 // Obtenemos el id del libro asociado al préstamo
 const libroId = loan.getDataValue("libroId");
 // Buscamos el libro en la base de datos
 const libro = await Book.findByPk(libroId);
 // Si el libro existe, incrementamos su stock en1
 if (libro) {
 const stock = libro.getDataValue("stock");
 await libro.update({ stock: stock +1 });
 }
 }

 // Eliminamos el préstamo de la base de datos
 await loan.destroy();
};



// Método que permite marcar un préstamo como devuelto
export const returnLoan = async (id: number) => {
 // Buscamos el préstamo por su id
 const loan = await Loan.findByPk(id);
 // Si no existe, lanzamos un error
 if (!loan) throw new Error("Préstamo no encontrado");

 // Si ya tiene fecha de devolución real, no podemos devolverlo de nuevo
 if (loan.getDataValue("fechaDevolucionReal")) {
 throw new Error("El préstamo ya fue devuelto");
 }

 // Establecemos la fecha de devolución real como la fecha actual
 loan.set("fechaDevolucionReal", new Date());
 // Guardamos los cambios en la base de datos
 await loan.save();

 // Recuperamos el id del libro asociado al préstamo
 const libroId = loan.getDataValue("libroId");
 // Buscamos el libro correspondiente
 const libro = await Book.findByPk(libroId);
 // Si el libro existe, incrementamos el stock en1
 if (libro) {
 const stock = libro.getDataValue("stock");
 await libro.update({ stock: stock +1 });
 }

 // Devolvemos el préstamo actualizado
 return loan;
};



// Método para obtener los préstamos activos
export const getActiveLoans = async () => {
 // Busca todos los préstamos que aún no tienen fecha de devolución real
 return Loan.findAll({
 where: { fechaDevolucionReal: null },
 include: [{ model: User, as: "usuario" }, { model: Book, as: "libro" }],
 // Incluye también los datos del usuario y del libro asociado
 });
};



// Método para obtener el historial completo de préstamos
export const getLoanHistory = async () => {
 // Devuelve todos los préstamos, sin filtrar, incluyendo usuario y libro
 return Loan.findAll({
 include: [{ model: User, as: "usuario" }, { model: Book, as: "libro" }],
 });
};
