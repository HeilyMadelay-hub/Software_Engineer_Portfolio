import React from 'react';

type StatCardProps = {
    title: string;
    value: string | number;
    color: 'blue' | 'green' | 'purple' | 'orange';
    icon?: React.ReactNode;
    subtitle?: string;
    className?: string;
};

const colorClasses: Record<StatCardProps['color'], string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
};

const DashboardEstadisticaCard: React.FC<StatCardProps> = ({
    title,
    value,
    color,
    icon,
    subtitle,
    className,
}) => {
    return (
        <div className={`bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow ${className ?? ''}`}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
                {icon && (
                    <div className={`${colorClasses[color]} opacity-80`} aria-hidden="true">
                        {icon}
                    </div>
                )}
            </div>

            <p className={`text-4xl font-bold ${colorClasses[color]} mb-1`}>{value}</p>

            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
    );
};

export default DashboardEstadisticaCard;