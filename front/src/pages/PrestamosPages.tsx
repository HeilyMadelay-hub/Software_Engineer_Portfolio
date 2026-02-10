import { useState, useEffect, useMemo } from 'react';
import Layout from "../components/layout/layout";
import { Modal } from '../components/ui/modal';
import useSearch from '../hooks/useSearch';
import LoanForm from '../components/loans/LoanForm';
import Table from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { loanService } from '../services/loanService';
import { bookService } from '../services/bookService';
import { userService } from '../services/userService';
import type { LoanWithDetails, User, Book, CreateLoanDTO } from '../types';

// Tipo auxiliar para la vista de la tabla con estado calculado
type LoanView = LoanWithDetails & {
    estado: 'Activo' | 'Vencido' | 'Devuelto' | 'Devuelto con retraso';
    libroTitulo: string;
    usuarioNombre: string;
};

const computeEstado = (loan: LoanWithDetails): LoanView['estado'] => {
    if (loan.fechaDevolucionReal) {
        const devolucion = new Date(loan.fechaDevolucionReal);
        const prevista = new Date(loan.fechaDevolucionPrevista);
        return devolucion > prevista ? 'Devuelto con retraso' : 'Devuelto';
    }
    const now = new Date();
    const prevista = new Date(loan.fechaDevolucionPrevista);
    return now > prevista ? 'Vencido' : 'Activo';
};

const toLoanView = (l: LoanWithDetails): LoanView => ({
    ...l,
    estado: computeEstado(l),
    libroTitulo: l.libro?.titulo ?? l.book?.titulo ?? `Libro #${l.libroId}`,
    usuarioNombre: l.usuario?.nombre ?? l.User?.nombre ?? `Usuario #${l.usuarioId}`,
});


const PrestamosPages = () => {
    const [loans, setLoans] = useState<LoanView[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Datos para el formulario de nuevo pr\u00e9stamo
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [availableBooks, setAvailableBooks] = useState<Book[]>([]);

    // Cargar pr\u00e9stamos, usuarios y libros desde el backend
    useEffect(() => {
        Promise.all([
            loanService.getAll(),
            userService.getAll(),
            bookService.getAll(),
        ])
            .then(([loansData, usersData, booksData]) => {
                setLoans(loansData.map(toLoanView));
                setAvailableUsers(usersData);
                setAvailableBooks(booksData);
            })
            .catch(err => console.error('Error al cargar datos:', err))
            .finally(() => setLoading(false));
    }, []);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const { query, setQuery, filtered, setFilter } = useSearch<LoanView>(
        loans,
        {
            searchFields: ['usuarioNombre', 'libroTitulo'],
            statusField: 'estado',
            initialFilter: 'all',
            debounceMs: 200,
            customFilter: (item: LoanView, q: string, filter: string) => {
                const qNorm = q.trim().toLowerCase();
                const matchesSearch = qNorm === '' ||
                    item.usuarioNombre.toLowerCase().includes(qNorm) ||
                    item.libroTitulo.toLowerCase().includes(qNorm);

                if (!matchesSearch) return false;

                const matchesStatus = filter === 'all' || item.estado === filter;
                if (!matchesStatus) return false;

                if (startDate || endDate) {
                    const loanTime = new Date(item.fechaPrestamo).getTime();
                    if (startDate) {
                        const s = new Date(startDate).setHours(0, 0, 0, 0);
                        if (loanTime < s) return false;
                    }
                    if (endDate) {
                        const e = new Date(endDate).setHours(23, 59, 59, 999);
                        if (loanTime > e) return false;
                    }
                }

                return true;
            }
        }
    );

    useEffect(() => {
        setFilter(statusFilter);
    }, [statusFilter, setFilter]);

    const addLoan = async (data: CreateLoanDTO) => {
        try {
            await loanService.create(data);
            // Recargar para obtener datos expandidos (usuario, libro)
            const allLoans = await loanService.getAll();
            setLoans(allLoans.map(toLoanView));
            // Actualizar libros (stock cambi\u00f3)
            const booksData = await bookService.getAll();
            setAvailableBooks(booksData);
        } catch (err) {
            console.error('Error al crear pr\u00e9stamo:', err);
            alert('No se pudo crear el pr\u00e9stamo.');
        }
        setIsModalOpen(false);
    };

    const markReturned = async (id: number) => {
        try {
            await loanService.returnBook(id);
            // Recargar pr\u00e9stamos y libros
            const allLoans = await loanService.getAll();
            setLoans(allLoans.map(toLoanView));
            const booksData = await bookService.getAll();
            setAvailableBooks(booksData);
        } catch (err) {
            console.error('Error al devolver libro:', err);
        }
    };

    const extendLoan = async (id: number, days = 7) => {
        const loan = loans.find(l => l.id === id);
        if (!loan || loan.estado !== 'Activo') return;
        try {
            const due = new Date(loan.fechaDevolucionPrevista);
            due.setDate(due.getDate() + days);
            await loanService.update(id, { fechaDevolucionPrevista: due.toISOString() });
            // Recargar
            const allLoans = await loanService.getAll();
            setLoans(allLoans.map(toLoanView));
        } catch (err) {
            console.error('Error al extender pr\u00e9stamo:', err);
        }
    };

    const computeDays = (dueDate: string) => {
        const now = new Date();
        const due = new Date(dueDate);
        const diffMs = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays > 0) return `${diffDays} d\u00eda${diffDays === 1 ? '' : 's'}`;
        const overdue = Math.abs(diffDays);
        return `Vencido hace ${overdue} d\u00eda${overdue === 1 ? '' : 's'}`;
    };

    const columns = useMemo(() => [
        { header: 'Libro', accessor: (l: LoanView) => l.libroTitulo },
        { header: 'Usuario', accessor: (l: LoanView) => l.usuarioNombre },
        { header: 'Pr\u00e9stamo desde', accessor: (l: LoanView) => new Date(l.fechaPrestamo).toLocaleDateString() },
        { header: 'Fecha l\u00edmite', accessor: (l: LoanView) => new Date(l.fechaDevolucionPrevista).toLocaleDateString() },
        {
            header: 'D\u00edas restantes / Duraci\u00f3n',
            accessor: (l: LoanView) => {
                if (l.estado === 'Devuelto' || l.estado === 'Devuelto con retraso') {
                    const dias = Math.ceil(
                        (new Date(l.fechaDevolucionReal || l.fechaDevolucionPrevista).getTime() -
                            new Date(l.fechaPrestamo).getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    return `${dias} d\u00edas`;
                }
                return computeDays(l.fechaDevolucionPrevista);
            }
        },
        { header: 'Estado', accessor: (l: LoanView) => <Badge variant={l.estado === 'Vencido' ? 'danger' : l.estado === 'Activo' ? 'warning' : 'success'}>{l.estado}</Badge> },
        {
            header: 'Acciones', accessor: (l: LoanView) => (
                <div className="flex gap-2 items-center">
                    {l.estado === 'Activo' && (
                        <>
                            <Button variant="success" onClick={() => markReturned(l.id)} className="px-2 py-1 text-sm">Devolver</Button>
                            <Button variant="primary" onClick={() => extendLoan(l.id)} className="px-2 py-1 text-sm">Extender</Button>
                        </>
                    )}
                    {l.estado === 'Vencido' && (
                        <Button variant="success" onClick={() => markReturned(l.id)} className="px-2 py-1 text-sm">Devolver</Button>
                    )}
                    {(l.estado === 'Devuelto' || l.estado === 'Devuelto con retraso') && (
                        <span className="text-gray-400"> _ </span>
                    )}
                </div>
            )
        },
    ], [loans]);


    const rowClass = (l: LoanView) => {
        if (l.estado === 'Vencido') return 'bg-red-100';
        if (l.estado === 'Devuelto' || l.estado === 'Devuelto con retraso') return 'bg-gray-50';
        const due = new Date(l.fechaDevolucionPrevista);
        const now = new Date();
        const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft < 3) return 'bg-yellow-100';
        return '';
    };

    return (
        <Layout title="Gesti&oacute;n de Pr&eacute;stamo">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Gesti&oacute;n de Pr&eacute;stamo</h1>
                <Button onClick={() => setIsModalOpen(true)} className="px-4 py-2" variant="primary">
                    + Nuevo  Pr&eacute;stamo
                </Button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex gap-4 items-center">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Buscar por usuario o t&iacute;tulo de libro..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border rounded-lg"
                        >
                            <option value="all">Todos</option>
                            <option value="Activo">Activo</option>
                            <option value="Vencido">Vencido</option>
                            <option value="Devuelto">Devuelto</option>
                            <option value="Devuelto con retraso">Devuelto con retraso</option>
                        </select>

                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 border rounded-lg"
                            title="Fecha inicio"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 border rounded-lg"
                            title="Fecha fin"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-500">Cargando prestamos...</div>
            ) : (
                <Table
                    columns={columns}
                    data={filtered}
                    keyExtractor={(l: LoanView) => l.id}
                    rowClass={rowClass}
                />
            )}

            {/* Modal para nuevo prestamo */}
            <Modal
                isOpen={isModalOpen}
                title="Registrar Nuevo Pr&eacute;stamo"
                onClose={() => setIsModalOpen(false)}
                maxWidth="sm"
            >
                <LoanForm
                    users={availableUsers}
                    books={availableBooks}
                    onConfirm={addLoan}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </Layout>
    );
};


export default PrestamosPages;