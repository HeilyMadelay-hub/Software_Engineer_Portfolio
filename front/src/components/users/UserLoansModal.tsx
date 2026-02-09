// src/components/users/UserLoansModal.tsx
import type { FC } from 'react';
import { Badge } from '../ui/badge';
import type { LoanWithDetails } from '../../types';

interface UserLoansModalProps {
    prestamosActivos: LoanWithDetails[];
    historialPrestamos: LoanWithDetails[];
}

const UserLoansModal: FC<UserLoansModalProps> = ({
    prestamosActivos,
    historialPrestamos,
}) => {
    return (
        <div className="space-y-6">
            {/* Prestamos Activos */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Pr&eacute;stamos Activos ({prestamosActivos.length})
                </h3>

                {prestamosActivos.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No hay préstamos activos</p>
                ) : (
                    <div className="space-y-2">
                        {prestamosActivos.map((prestamo) => (
                            <div
                                key={prestamo.id}
                                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div>
                                    <div className="font-medium text-gray-900">
                                        {prestamo.libro?.titulo ?? prestamo.book?.titulo ?? 'Libro desconocido'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Prestado: {new Date(prestamo.fechaPrestamo).toLocaleDateString()}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Devolver antes de: {new Date(prestamo.fechaDevolucionPrevista).toLocaleDateString()}
                                    </div>
                                </div>
                                <Badge variant={prestamo.fechaDevolucionReal ? 'success' : 'warning'}>
                                    {prestamo.fechaDevolucionReal ? 'Devuelto' : 'Activo'}
                                </Badge>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Historial */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Historial ({historialPrestamos.length})
                </h3>

                {historialPrestamos.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Sin historial de préstamos</p>
                ) : (
                    <div className="space-y-2">
                        {historialPrestamos.map((prestamo) => (
                            <div
                                key={prestamo.id}
                                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {prestamo.libro?.titulo ?? prestamo.book?.titulo ?? 'Libro desconocido'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Devuelto: {prestamo.fechaDevolucionReal ? new Date(prestamo.fechaDevolucionReal).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                    <Badge variant="success">Devuelto</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserLoansModal;