import Table from '../ui/table';
import { Button } from '../ui/button';
import type { User } from '../../types';

interface UserListProps {
    users: User[];
    onEdit: (user: User) => void;
    onDelete: (userId: number) => void;
    onViewLoans: (user: User) => void;
}

const UserList = ({ users, onEdit, onDelete, onViewLoans }: UserListProps) => {
    const columns = [
        { header: 'Nombre', accessor: (u: User) => u.nombre },
        { header: 'Email', accessor: (u: User) => u.email },
        {
            header: 'Estado',
            accessor: (u: User) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                </span>
            ),
            className: 'text-center'
        },
        {
            header: 'Acciones',
            accessor: (u: User) => (
                <div className="flex gap-2">
                    <Button variant="primary" onClick={() => onViewLoans(u)} className="px-2 py-1 text-sm">Ver prestamos</Button>
                    <Button variant="secondary" onClick={() => onEdit(u)} className="px-2 py-1 text-sm">Editar</Button>
                    <Button
                        variant="danger"
                        onClick={() => {
                            if (window.confirm(`¿Estás seguro de eliminar a ${u.nombre}?`)) {
                                onDelete(u.id);
                            }
                        }}
                        className="px-2 py-1 text-sm"
                    >
                        Eliminar
                    </Button>
                </div>
            )
        }
    ];

    return (
        <Table
            columns={columns}
            data={users}
            keyExtractor={(u: User) => u.id}
        />
    );
};

export default UserList;