import { User } from "../models";//Importamos el modelo de usuario para trabajar con la base de datos


//Crear usuario
export const createUser = async (data: {
    nombre: string;
    email: string;
    activo?: boolean;
}) => {
    return User.create(data);//Crea un nuevo registro de usuario con los datos recibidos
};


//Obtener todos los usuarios
export const getUsers = async () => {
    return User.findAll();//Devuelve todos los usuarios registrados en la base de datos
};


//Obtener usuario por ID
export const getUserById = async (id: number) => {
    return User.findByPk(id);//Busca un usuario por su clave primaria (id)
};


//Actualizar usuario
export const updateUser = async (
    id: number,
    data: Partial<{ nombre: string; email: string; activo: boolean }>
) => {
    const user = await User.findByPk(id);//Buscamos el usuario por id

    if (!user) throw new Error("Usuario no encontrado");// Si no existe lanzamos un error

    await user.update(data);//Si existe, actualizamos sus datos

    return user;//Devolvemos el usuario actualizado
};


//Eliminar usuario
export const deleteUser = async (id: number) => {
    const user = await User.findByPk(id); // Buscamos el usuario por id

    if (!user) throw new Error("Usuario no encontrado"); // Si no existe lanzamos un error

    await user.destroy();// Eliminamos el usuario de la base de datos
};
