import type { FC, ChangeEvent } from 'react';

type InputProps = {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    name?: string;
    className?: string;
    required?: boolean;
};

const Input: FC<InputProps> = ({ value, onChange, placeholder = '', type = 'text', name, className = '', required = false }) => {
    return (
        <input
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        />
    );
};

export default Input;
