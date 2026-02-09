import React from 'react';

interface CardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
    className?: string;
}

export function Card({
    title,
    value,
    subtitle,
    icon,
    color = 'blue',
    className = '',
}: CardProps) {
    const colorStyles = {
        blue: 'border-blue-500 bg-blue-50',
        green: 'border-green-500 bg-green-50',
        orange: 'border-orange-500 bg-orange-50',
        red: 'border-red-500 bg-red-50',
        purple: 'border-purple-500 bg-purple-50',
    };

    const textColors = {
        blue: 'text-blue-700',
        green: 'text-green-700',
        orange: 'text-orange-700',
        red: 'text-red-700',
        purple: 'text-purple-700',
    };

    return (
        <div className={`border-l-4 ${colorStyles[color]} p-6 rounded-lg shadow-sm ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h3 className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                        {title}
                    </h3>
                    <p className={`text-3xl font-bold mt-2 ${textColors[color]}`}>
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
                    )}
                </div>
                {icon && (
                    <div className={`ml-4 ${textColors[color]} opacity-75`}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}