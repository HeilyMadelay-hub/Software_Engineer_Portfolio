// src/pages/books/BooksPage.tsx
import { useState, useMemo, useEffect } from 'react';
import Layout from '../components/layout/layout';
import { Modal } from '../components/ui/modal';
import BookForm from '../components/books/BookForm';
import useSearch from '../hooks/useSearch';
import { bookService } from '../services/bookService';
import { loanService } from '../services/loanService';
import Table from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import type { Book, LoanWithDetails, CreateBookDTO } from '../types';

const BooksPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    // Cargar libros desde el backend
    useEffect(() => {
        bookService.getAll()
            .then(setBooks)
            .catch(err => console.error('Error al cargar libros:', err))
            .finally(() => setLoading(false));
    }, []);

    const { query, setQuery, filtered } = useSearch<Book>(books, {
        searchFields: ['titulo', 'autor'],
        debounceMs: 300,
    });

    // --- Estado para modal de prestamos ---
    const [loansModalOpen, setLoansModalOpen] = useState(false);
    const [loansLoading, setLoansLoading] = useState(false);
    const [loansForBook, setLoansForBook] = useState<LoanWithDetails[]>([]);
    const [loansBookTitle, setLoansBookTitle] = useState<string | null>(null);

    const handleEdit = (book: Book) => {
        setSelectedBook(book);
        setIsModalOpen(true);
    };

    const handleDelete = async (bookId: number) => {
        try {
            await bookService.delete(bookId);
            setBooks(prev => prev.filter(b => b.id !== bookId));
        } catch (err) {
            console.error('Error al eliminar libro:', err);
            alert('No se pudo eliminar el libro. Puede tener préstamos activos.');
        }
    };

    const handleViewLoans = async (bookId: number) => {
        const book = books.find(b => b.id === bookId);
        setLoansBookTitle(book ? book.titulo : null);
        setLoansModalOpen(true);
        setLoansLoading(true);
        setLoansForBook([]);

        try {
            const all = await loanService.getAll();
            const filteredLoans = (all || []).filter((l) => l.libroId === bookId);
            setLoansForBook(filteredLoans);
        } catch (err) {
            console.error('Error al cargar prestamos:', err);
            setLoansForBook([]);
        } finally {
            setLoansLoading(false);
        }
    };

    const handleSave = async (data: CreateBookDTO & { id?: number }) => {
        try {
            if (data.id) {
                const updated = await bookService.update(data.id, {
                    titulo: data.titulo,
                    autor: data.autor,
                    stock: data.stock,
                });
                setBooks(prev => prev.map(b => b.id === updated.id ? updated : b));
            } else {
                const created = await bookService.create({
                    titulo: data.titulo,
                    autor: data.autor,
                    stock: data.stock,
                });
                setBooks(prev => [...prev, created]);
            }
        } catch (err) {
            console.error('Error al guardar libro:', err);
        }
        setIsModalOpen(false);
        setSelectedBook(null);
    };

    const columns = useMemo(() => [
        { header: 'Titulo', accessor: (b: Book) => b.titulo },
        { header: 'Autor', accessor: (b: Book) => b.autor },
        {
            header: 'Stock', accessor: (b: Book) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{b.stock}</span>
                    <Badge variant={b.stock > 0 ? 'success' : 'danger'}>
                        {b.stock > 0 ? 'Disponible' : 'Sin stock'}
                    </Badge>
                </div>
            )
        },
        {
            header: 'Acciones', accessor: (b: Book) => (
                <div className="flex gap-2">
                    <Button variant="primary" onClick={() => handleViewLoans(b.id)} className="px-2 py-1 text-sm">
                        Ver prestamos
                    </Button>
                    <Button variant="secondary" onClick={() => handleEdit(b)} className="px-2 py-1 text-sm">
                        Editar
                    </Button>
                    <Button variant="danger" onClick={() => { if (window.confirm(`¿Estás seguro de eliminar "${b.titulo}"?`)) handleDelete(b.id); }} className="px-2 py-1 text-sm">
                        Eliminar
                    </Button>
                </div>
            )
        }
    ], [books]);

    return (
        <Layout title="Gestión de Libros">
            {/* Barra de acciones */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gestión de Libros</h1>
                <Button onClick={() => { setSelectedBook(null); setIsModalOpen(true); }} className="px-4 py-2" variant="primary">
                    + Nuevo libro
                </Button>
            </div>

            {/* Barra de búsqueda */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex gap-4 items-center">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Buscar por título o autor..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-500">Cargando libros...</div>
            ) : (
                <Table columns={columns} data={filtered} keyExtractor={(b: Book) => b.id} />
            )}

            {/* Modal para agregar/editar libro */}
            <Modal
                isOpen={isModalOpen}
                title={selectedBook ? 'Editar Libro' : 'Nuevo Libro'}
                onClose={() => { setIsModalOpen(false); setSelectedBook(null); }}
            >
                <BookForm
                    book={selectedBook}
                    onClose={() => { setIsModalOpen(false); setSelectedBook(null); }}
                    onSave={handleSave}
                />
            </Modal>

            {/* Modal de prestamos */}
            <Modal
                isOpen={loansModalOpen}
                title={loansBookTitle ? `Préstamos - ${loansBookTitle}` : 'Préstamos'}
                onClose={() => { setLoansModalOpen(false); setLoansForBook([]); setLoansBookTitle(null); }}
                maxWidth="lg"
            >
                {loansLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <span className="text-gray-500">Cargando préstamos...</span>
                    </div>
                ) : loansForBook.length === 0 ? (
                    <div className="py-6 text-center text-gray-600">No hay préstamos para este libro.</div>
                ) : (
                    <Table
                        columns={[
                            { header: 'ID', accessor: (l) => l.id },
                            { header: 'Usuario', accessor: (l) => l.usuario?.nombre ?? l.User?.nombre ?? '—' },
                            { header: 'Fecha préstamo', accessor: (l) => new Date(l.fechaPrestamo).toLocaleDateString() },
                            { header: 'Devolución prevista', accessor: (l) => new Date(l.fechaDevolucionPrevista).toLocaleDateString() },
                            { header: 'Devolución real', accessor: (l) => l.fechaDevolucionReal ? new Date(l.fechaDevolucionReal).toLocaleDateString() : '—' },
                            {
                                header: 'Estado',
                                accessor: (l) => (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${l.fechaDevolucionReal ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                        {l.fechaDevolucionReal ? 'Devuelto' : 'Activo'}
                                    </span>
                                )
                            }
                        ]}
                        data={loansForBook}
                        keyExtractor={(l) => l.id}
                    />
                )}
            </Modal>
        </Layout>
    );
};

export default BooksPage;