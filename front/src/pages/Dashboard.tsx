import * as React from 'react';
import Layout from '../components/layout/layout';
import DashboardStatisticaCard from '../components/ui/dashboardestadisticacard';
import TableEstadistica from '../components/ui/TableEstadistica';
import { Modal } from '../components/ui/modal';
import { Button } from '../components/ui/button';
import Spinner from '../components/ui/spinner';
import { bookService } from '../services/bookService';
import { loanService } from '../services/loanService';
import type { Book } from '../types';

// Tipo para préstamo activo con campos calculados para la vista
type PrestamoView = {
    id: number;
    libro: string;
    usuario: string;
    fechaInicio: string;
    diasRestantes: number;
    loanId: number; // ID real del préstamo para la devolución
}

type LibroMasPrestado = {
    id: number;
    titulo: string;
    autor: string;
    vecesPrestado: number;
}

type DashboardStats = {
    librosTotales: number;
    prestamosActivos: number;
    librosDisponibles: number;
    prestamosVencidos: number;
}

const Dashboard = () => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [prestamoSeleccionado, setPrestamoSeleccionado] = React.useState<PrestamoView | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    const [ultimosPrestamos, setUltimosPrestamos] = React.useState<PrestamoView[]>([]);
    const [librosMasPrestados, setLibrosMasPrestados] = React.useState<LibroMasPrestado[]>([]);
    const [stats, setStats] = React.useState<DashboardStats>({
        librosTotales: 0,
        prestamosActivos: 0,
        librosDisponibles: 0,
        prestamosVencidos: 0,
    });

    // Función para cargar todos los datos del dashboard
    const loadDashboard = async () => {
        try {
            const [books, allLoans] = await Promise.all([
                bookService.getAll(),
                loanService.getAll(),
            ]);

            // Préstamos activos (no devueltos)
            const activos = allLoans.filter(l => !l.fechaDevolucionReal);
            const now = new Date();

            // Calcular estadísticas
            const vencidos = activos.filter(l => new Date(l.fechaDevolucionPrevista) < now);
            const librosDisponibles = books.filter(b => b.stock > 0).length;

            setStats({
                librosTotales: books.length,
                prestamosActivos: activos.length,
                librosDisponibles,
                prestamosVencidos: vencidos.length,
            });

            // Últimos 5 préstamos activos para la tabla
            const ultimosActivos: PrestamoView[] = activos
                .slice(0, 5)
                .map(l => {
                    const due = new Date(l.fechaDevolucionPrevista);
                    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    return {
                        id: l.id,
                        loanId: l.id,
                        libro: l.libro?.titulo ?? l.book?.titulo ?? `Libro #${l.libroId}`,
                        usuario: l.usuario?.nombre ?? l.User?.nombre ?? `Usuario #${l.usuarioId}`,
                        fechaInicio: new Date(l.fechaPrestamo).toLocaleDateString(),
                        diasRestantes: diffDays,
                    };
                });
            setUltimosPrestamos(ultimosActivos);

            // Libros más prestados: contar préstamos por libro
            const conteo = new Map<number, { book: Book; count: number }>();
            for (const loan of allLoans) {
                const bookId = loan.libroId;
                const existing = conteo.get(bookId);
                if (existing) {
                    existing.count++;
                } else {
                    const book = books.find(b => b.id === bookId);
                    if (book) {
                        conteo.set(bookId, { book, count: 1 });
                    }
                }
            }
            const topLibros: LibroMasPrestado[] = Array.from(conteo.values())
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map(({ book, count }) => ({
                    id: book.id,
                    titulo: book.titulo,
                    autor: book.autor,
                    vecesPrestado: count,
                }));
            setLibrosMasPrestados(topLibros);

        } catch (err) {
            console.error('Error al cargar dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadDashboard();
    }, []);

    const handleOpenModal = (prestamo: PrestamoView) => {
        setPrestamoSeleccionado(prestamo);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setPrestamoSeleccionado(null);
    };

    const handleConfirmarDevolucion = async () => {
        if (!prestamoSeleccionado) return;
        setIsLoading(true);

        try {
            await loanService.returnBook(prestamoSeleccionado.loanId);
            // Recargar dashboard completo tras la devolución
            await loadDashboard();
            handleCloseModal();
        } catch (error) {
            console.error('Error al devolver el libro:', error);
            alert('Error al devolver el libro.');
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Sistema de Biblioteca">
                <div className="flex items-center justify-center py-16">
                    <span className="text-gray-500">Cargando dashboard...</span>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Sistema de Biblioteca">
            {/* Tarjetas de estadísticas superiores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <DashboardStatisticaCard
                    title="Libros totales"
                    value={stats.librosTotales}
                    color="blue"
                    icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    }
                />
                <DashboardStatisticaCard
                    title="Préstamos activos"
                    value={stats.prestamosActivos}
                    color="orange"
                    icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <DashboardStatisticaCard
                    title="Libros disponibles"
                    value={stats.librosDisponibles}
                    color="green"
                    icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <DashboardStatisticaCard
                    title="Préstamos vencidos"
                    value={stats.prestamosVencidos}
                    color="purple"
                    icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    }
                />
            </div>

            {/* Dos tablas de estadísticas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TableEstadistica
                    title="Últimos préstamos activos"
                    data={ultimosPrestamos}
                    keyExtractor={(item) => item.id}
                    columns={[
                        {
                            header: 'Libro',
                            accessor: 'libro',
                            className: 'text-gray-900 font-medium',
                        },
                        {
                            header: 'Usuario',
                            accessor: 'usuario',
                            className: 'text-gray-700',
                        },
                        {
                            header: 'Fecha inicio',
                            accessor: 'fechaInicio',
                            className: 'text-gray-600',
                        },
                        {
                            header: 'Días restantes',
                            accessor: 'diasRestantes',
                            className: 'text-gray-600',
                            align: 'center',
                        },
                        {
                            header: 'Acciones',
                            accessor: (item: PrestamoView) => (
                                <Button onClick={() => handleOpenModal(item)} className="px-4 py-1.5 text-xs" variant="primary">
                                    Devolver
                                </Button>
                            ),
                            align: 'center',
                        }
                    ]}
                    emptyMessage="No hay préstamos activos"
                />

                <TableEstadistica
                    title="Libros más prestados"
                    data={librosMasPrestados}
                    keyExtractor={(item) => item.id}
                    columns={[
                        {
                            header: 'Título',
                            accessor: 'titulo',
                            className: 'text-gray-900 font-medium',
                        },
                        {
                            header: 'Autor',
                            accessor: 'autor',
                            className: 'text-gray-700',
                        },
                        {
                            header: 'Veces prestado',
                            accessor: 'vecesPrestado',
                            className: 'text-gray-600 font-semibold',
                            align: 'center',
                        }
                    ]}
                    emptyMessage="No hay datos de préstamos"
                />
            </div>

            {/* Modal de confirmación de devolución */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title="Confirmar devolución"
                maxWidth="md"
            >
                {prestamoSeleccionado && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">Libro:</span>
                                <span className="text-sm font-semibold text-gray-900">{prestamoSeleccionado.libro}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">Usuario:</span>
                                <span className="text-sm text-gray-900">{prestamoSeleccionado.usuario}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">Fecha de préstamo:</span>
                                <span className="text-sm text-gray-900">{prestamoSeleccionado.fechaInicio}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">Fecha de devolución:</span>
                                <span className="text-sm text-gray-900">{new Date().toISOString().split('T')[0]}</span>
                            </div>
                        </div>

                        {prestamoSeleccionado.diasRestantes < 0 && (
                            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-sm text-amber-800">
                                    Este préstamo está vencido por {Math.abs(prestamoSeleccionado.diasRestantes)} días.
                                </p>
                            </div>
                        )}

                        <p className="text-gray-700">
                            ¿Estás seguro de que deseas marcar este libro como devuelto?
                        </p>

                        <div className="flex gap-3 justify-end pt-4">
                            <Button onClick={handleCloseModal} variant="secondary" disabled={isLoading} className="px-4 py-2 text-sm">Cancelar</Button>
                            <Button onClick={handleConfirmarDevolucion} variant="primary" disabled={isLoading} className="px-4 py-2 text-sm flex items-center gap-2">
                                {isLoading ? (<><Spinner size={16} />Procesando...</>) : 'Confirmar devolución'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default Dashboard;