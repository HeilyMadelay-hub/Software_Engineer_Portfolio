import type { FC } from 'react';
import { useState } from 'react';
import Input from '../ui/input';
import { Button } from '../ui/button';
import type { User, Book } from '../../types';
import React from 'react';

type Props = {
    users: User[];
    books: Book[];
    onConfirm: (data: { usuarioId: number; libroId: number; diasPrestamo: number }) => void;
    onCancel: () => void;
};

const LoanForm: FC<Props> = ({ users, books, onConfirm, onCancel }) => {
    const [usuarioId, setUsuarioId] = useState(users[0]?.id ?? 0);
    const [libroId, setLibroId] = useState(books[0]?.id ?? 0);
    const [diasPrestamo, setDiasPrestamo] = useState(30);

    return (
        <div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Usuario</label>
                <select className="w-full mt-1 p-2 border rounded" value={usuarioId} onChange={(e) => setUsuarioId(Number(e.target.value))}>
                    {users.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                </select>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Libro</label>
                <select className="w-full mt-1 p-2 border rounded" value={libroId} onChange={(e) => setLibroId(Number(e.target.value))}>
                    {books.filter(b => b.stock > 0).map(b => <option key={b.id} value={b.id}>{b.titulo} (stock: {b.stock})</option>)}
                </select>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Duraci&oacute;n (d&iacute;as)</label>
                <Input type="number" value={String(diasPrestamo)} onChange={(e) => setDiasPrestamo(Number(e.target.value))} />
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
                <Button variant="primary" onClick={() => onConfirm({ usuarioId, libroId, diasPrestamo })}>Confirmar Pr&eacute;stamos</Button>
            </div>
        </div>
    );
};

export default LoanForm;
