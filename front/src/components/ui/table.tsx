// src/components/ui/Table.tsx
import React from 'react';

type Column<T> = {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

type TableProps<T> = {
    title?: string;
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T) => string | number;
    // optional row class function to allow per-row styling
    rowClass?: (item: T) => string;
}

function Table<T>({ title, columns, data, keyExtractor, rowClass }: TableProps<T>) {
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* 🔝 Título de la tabla (opcional) */}
            {title && (
                <div className="px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {title}
                    </h2>
                </div>
            )}

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    {/* Encabezados */}
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase"
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Cuerpo de la tabla */}
                    <tbody className="divide-y divide-gray-200">
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-8 text-center text-gray-500"
                                >
                                    No hay datos disponibles
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={keyExtractor(item)} className={`${rowClass ? rowClass(item) : ''} hover:bg-gray-50`}>
                                    {columns.map((column, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className={`px-4 py-3 text-sm ${column.className || 'text-gray-600'
                                                }`}
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

export default Table;