// src/pages/users/UsersPage.tsx
import { useState, useEffect } from 'react';
import Layout from '../components/layout/layout';
import { Modal } from '../components/ui/modal';
import UserForm from '../components/users/UserForm';
import UserList from '../components/users/UserList';
import UserLoansModal from '../components/users/UserLoansModal';
import useSearch from '../hooks/useSearch';
import { Button } from '../components/ui/button';
import { userService } from '../services/userService';
import { loanService } from '../services/loanService';
import type { User, CreateUserDTO, LoanWithDetails } from '../types';

const UsersPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loanModalUser, setLoanModalUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Estado para préstamos del usuario seleccionado
    const [userLoansActivos, setUserLoansActivos] = useState<LoanWithDetails[]>([]);
    const [userLoansHistorial, setUserLoansHistorial] = useState<LoanWithDetails[]>([]);

    // Cargar usuarios desde el backend
    useEffect(() => {
        userService.getAll()
            .then(setUsers)
            .catch(err => console.error('Error al cargar usuarios:', err))
            .finally(() => setLoading(false));
    }, []);

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (userId: number) => {
        try {
            await userService.delete(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            console.error('Error al eliminar usuario:', err);
            alert('No se pudo eliminar el usuario.');
        }
    };

    const handleViewLoans = async (user: User) => {
        setLoanModalUser(user);
        try {
            const allLoans = await loanService.getAll();
            const userLoans = allLoans.filter(l => l.usuarioId === user.id);
            setUserLoansActivos(userLoans.filter(l => !l.fechaDevolucionReal));
            setUserLoansHistorial(userLoans.filter(l => l.fechaDevolucionReal));
        } catch (err) {
            console.error('Error al cargar préstamos del usuario:', err);
            setUserLoansActivos([]);
            setUserLoansHistorial([]);
        }
    };

    const handleSave = async (data: CreateUserDTO & { id?: number }) => {
        try {
            if (data.id) {
                const updated = await userService.update(data.id, {
                    nombre: data.nombre,
                    email: data.email,
                });
                setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            } else {
                const created = await userService.create({
                    nombre: data.nombre,
                    email: data.email,
                });
                setUsers(prev => [...prev, created]);
            }
        } catch (err) {
            console.error('Error al guardar usuario:', err);
        }
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    // Búsqueda por nombre y email
    const { query, setQuery, filtered } = useSearch(users, { searchFields: ['nombre', 'email'], debounceMs: 200 });

    return (
        <Layout title="Gestión de Usuarios">
            {/* Barra de acciones */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
                <Button
                    onClick={() => {
                        setSelectedUser(null);
                        setIsModalOpen(true);
                    }}
                    className="px-4 py-2"
                    variant="primary"
                >
                    + Nuevo usuario
                </Button>
            </div>

            {/* Barra de búsqueda */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg
                        className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

            {/* Lista de usuarios */}
            {loading ? (
                <div className="text-center py-8 text-gray-500">Cargando usuarios...</div>
            ) : (
                <UserList
                    users={filtered}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewLoans={handleViewLoans}
                />
            )}

            {/* Modal: Crear/Editar Usuario */}
            <Modal
                isOpen={isModalOpen}
                title={selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                }}
            >
                <UserForm
                    user={selectedUser}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedUser(null);
                    }}
                    onSave={handleSave}
                />
            </Modal>

            {/* Modal: Ver Préstamos del Usuario */}
            {loanModalUser && (
                <Modal
                    isOpen={!!loanModalUser}
                    title={`Préstamos de ${loanModalUser.nombre}`}
                    onClose={() => { setLoanModalUser(null); setUserLoansActivos([]); setUserLoansHistorial([]); }}
                    maxWidth="lg"
                >
                    <UserLoansModal
                        prestamosActivos={userLoansActivos}
                        historialPrestamos={userLoansHistorial}
                    />
                </Modal>
            )}
        </Layout>
    );
};

export default UsersPage;