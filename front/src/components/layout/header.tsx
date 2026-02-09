import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

// Definición de tipos para el Header
type HeaderProps = {
    title: string;
    logo?: string;
    userEmail?: string;
}

// Componente Header
const Header: React.FC<HeaderProps> = ({
    title,
    logo = '/logo.jpg',
    userEmail,
}) => {
    const navigate = useNavigate();

    // Obtener el email del usuario actual si no se proporciona
    const currentUser = authService.getCurrentUser();
    const displayEmail = userEmail || currentUser?.email || 'Usuario';

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <header className="bg-[#2E76C2] flex items-center justify-between px-4 py-2 rounded-t-lg">
            {/* Lado izquierdo: Logo y Título */}
            <div className="flex items-center gap-4">
                <img src={logo} alt="Logo" className="h-10 w-auto" />
                <h1 className="text-2xl font-semibold bg-[#2E76C2] text-white">{title}</h1>
            </div>

            {/* Lado derecho: Email y Botón Cerrar Sesión */}
            <div className="flex items-center gap-6">

                <span className="text-white text-sm mr-4">
                    {displayEmail}
                </span>

                <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                    Cerrar sesi&oacute;n
                </button>
            </div>
        </header>
    );
};

export default Header;