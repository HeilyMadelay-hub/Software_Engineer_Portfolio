import React from 'react';
import Header from './header'; // Corrigiendo el caso de mayúsculas/minúsculas en la importación
import Sidebar from './sidebar'; // Corrigiendo el caso de mayúsculas/minúsculas en la importación

type LayoutProps = {
    children: React.ReactNode;
    title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'Sistema de Biblioteca' }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header title={title} />

            <div className="flex">
                <Sidebar />

                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;