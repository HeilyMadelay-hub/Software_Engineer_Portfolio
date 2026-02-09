import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
    className?: string;
}

export function Badge({
    children,
    variant = 'default',
    className = '',
}: BadgeProps) {
    const variants = {
        success: 'bg-green-100 text-green-800 border-green-200',
        warning: 'bg-orange-100 text-orange-800 border-orange-200',
        danger: 'bg-red-100 text-red-800 border-red-200',
        info: 'bg-blue-100 text-blue-800 border-blue-200',
        default: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}
        >
            {children}
        </span>
    );
}