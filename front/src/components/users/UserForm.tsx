// src/components/users/UserForm.tsx
import Input from '../ui/input';
import { Button } from '../ui/button';
import { useState } from 'react';
import type { FC, ChangeEvent } from 'react';
import type { User, CreateUserDTO } from '../../types';

interface UserFormProps {
    user?: User | null;
    onClose: () => void;
    onSave?: (data: CreateUserDTO & { id?: number }) => void;
}

const UserForm: FC<UserFormProps> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        nombre: user?.nombre || '',
        email: user?.email || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...(user && user.id ? { id: user.id } : {}),
            nombre: formData.nombre,
            email: formData.email,
        };
        if (onSave) onSave(payload);
        onClose();
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo *
                </label>
                <Input
                    type="text"
                    name="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Ana Garcia"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                </label>
                <Input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@email.com"
                />
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <Button type="button" onClick={onClose} variant="secondary" className="px-4 py-2 text-sm">
                    Cancelar
                </Button>
                <Button type="submit" variant="primary" className="px-4 py-2 text-sm">
                    {user ? 'Actualizar' : 'Guardar'}
                </Button>
            </div>
        </form>
    );
};

export default UserForm;