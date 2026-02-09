import React from 'react';

type SpinnerProps = {
    size?: number; // px
    className?: string;
};

const Spinner: React.FC<SpinnerProps> = ({ size = 16, className = '' }) => (
    <svg
        className={`${className} animate-spin`}
        width={size}
        height={size}
        viewBox="002424"
        fill="none"
        aria-hidden
    >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M412a880018-8v4a44000-44H4z"></path>
    </svg>
);

export default Spinner;
