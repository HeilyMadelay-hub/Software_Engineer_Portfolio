// src/components/ui/TableEstadistica.tsx
import React from 'react';

// Tipos genéricos para columnas y datos
type Column<T> = {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
    align?: 'left' | 'center' | 'right';
}

type TableEstadisticaProps<T> = {
    title: string;
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T) => string | number;
    emptyMessage?: string;
}

function TableEstadistica<T>({
    title,
    columns,
    data,
    keyExtractor,
    emptyMessage = 'No hay datos disponibles'
}: TableEstadisticaProps<T>) {

    const getAlignment = (align?: 'left' | 'center' | 'right') => {
        switch (align) {
            case 'center':
                return 'text-center';
            case 'right':
                return 'text-right';
            default:
                return 'text-left';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            {/* 🔝 Título de la tabla */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-800">
                    {title}
                </h2>
            </div>

            {/* 📊 Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    {/* Encabezados */}
                    <thead className="bg-white border-b border-gray-200">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className={`px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider ${getAlignment(column.align)}`}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Cuerpo de la tabla */}
                    <tbody className="bg-white divide-y divide-gray-100">
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-6 py-12 text-center text-sm text-gray-500"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr
                                    key={keyExtractor(item)}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    {columns.map((column, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className={`px-6 py-4 text-sm whitespace-nowrap ${column.className || 'text-gray-600'
                                                } ${getAlignment(column.align)}`}
                                        >
                                            {typeof column.accessor === 'function'
                                                ? column.accessor(item)
                                                : String(item[column.accessor])}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TableEstadistica;