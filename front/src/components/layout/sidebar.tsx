import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Definición de tipos
type SidebarItem = {
    id: string;
    label: string;
    path: string;
    icon: React.ReactNode;
}

type SidebarProps = {
    className?: string;
}

// Componente Sidebar
const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Items del menú
    const menuItems: SidebarItem[] = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            path: '/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            id: 'libros',
            label: 'Libros',
            path: '/libros',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            )
        },
        {
            id: 'usuarios',
            label: 'Usuarios',
            path: '/usuarios',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        },
        {
            id: 'prestamos',
            label: 'Pr\u00E9stamos',
            path: '/prestamos',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        }
    ];

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (

        <aside className={`w-64 bg-white border-r shadow-sm min-h-screen ${className}`}>

            <nav className="py-4">
                <ul className="space-y-1">
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => handleNavigation(item.path)}
                                className={`
                                    w-full flex items-center gap-3 px-6 py-3 text-left transition-colors
                                    ${isActive(item.path)
                                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                                    }
                                `}
                            >
                                <span className={isActive(item.path) ? 'text-blue-600' : 'text-gray-400'}>
                                    {item.icon}
                                </span>
                                <span className="font-medium text-sm">
                                    {item.label}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;