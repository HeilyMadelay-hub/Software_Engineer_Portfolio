// src/components/books/BookForm.tsx
import React, { useEffect, useState } from 'react';
import type { Book, CreateBookDTO } from '../../types';

interface BookFormProps {
    onClose: () => void;
    onSave?: (data: CreateBookDTO & { id?: number }) => void;
    book?: Book | null;
}

const BookForm = ({ onClose, onSave, book = null }: BookFormProps) => {
    const [formData, setFormData] = useState({
        titulo: '',
        autor: '',
        stock: '',
    });

    useEffect(() => {
        if (book) {
            setFormData({
                titulo: book.titulo || '',
                autor: book.autor || '',
                stock: String(book.stock ?? ''),
            });
        }
    }, [book]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...(book && book.id ? { id: book.id } : {}),
            titulo: formData.titulo,
            autor: formData.autor,
            stock: Number(formData.stock),
        };

        if (onSave) onSave(payload);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const isEditing = Boolean(book && book.id);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titulo *
                </label>
                <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Autor *
                </label>
                <input
                    type="text"
                    name="autor"
                    value={formData.autor}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock *
                </label>
                <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="0"
                />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 mt-6">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    {isEditing ? 'Guardar cambios' : 'Guardar'}
                </button>
            </div>
        </form>
    );
};

export default BookForm;