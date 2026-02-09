import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import Input from '../components/ui/input'
import { Button } from '../components/ui/button'

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            await authService.login(email, password)
            console.log('Entro en dashboard')
            navigate('/dashboard')
            
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión')
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <div className="max-w-md w-full space-y-8">

                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-blue-600 rounded-full p-4">
                            <svg
                                className="w-12 h-12 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                            </svg>
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900">
                        Biblioteca Digital
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Inicia sesión para continuar
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Correo electrónico
                            </label>
                            <Input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@biblioteca.com"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña
                            </label>
                            <Input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                                {error}
                            </div>
                        )}

                        {/* Button */}
                        <Button type="submit" disabled={isLoading} variant="primary" className="w-full py-3">
                            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500">
                    ©2026 Biblioteca Digital
                </p>
            </div>
        </div>
    )
}

export default LoginPage
