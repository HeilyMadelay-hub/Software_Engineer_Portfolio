import { Button } from '../ui/button';
import type { Book } from '../../types';

interface BookListProps {
    books: Book[];
    onEdit: (book: Book) => void;
    onDelete: (bookId: number) => void;
    onViewLoans: (bookId: number) => void;
}

const BookList = ({ books, onEdit, onDelete, onViewLoans }: BookListProps) => {
    if (books.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay libros</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Comienza agregando un nuevo libro a la biblioteca.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Libro
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Autor
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {books.map((book) => (
                            <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">
                                        {book.titulo}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {book.autor}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <span className="font-semibold">{book.stock}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${book.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {book.stock > 0 ? 'Disponible' : 'Sin stock'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex gap-3">
                                        <Button variant="secondary" onClick={() => onViewLoans(book.id)} className="px-2 py-1 text-sm">Ver prestamos</Button>
                                        <Button variant="secondary" onClick={() => onEdit(book)} className="px-2 py-1 text-sm">Editar</Button>
                                        <Button variant="danger" onClick={() => { if (window.confirm(`¿Estás seguro de eliminar "${book.titulo}"?`)) onDelete(book.id); }} className="px-2 py-1 text-sm">Eliminar</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Resumen */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Total de libros: <strong>{books.length}</strong></span>
                    <span>
                        Disponibles: <strong className="text-green-600">
                            {books.filter(b => b.stock > 0).length}
                        </strong>
                    </span>
                    <span>
                        Sin stock: <strong className="text-red-600">
                            {books.filter(b => b.stock === 0).length}
                        </strong>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BookList;
