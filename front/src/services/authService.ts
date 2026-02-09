import { DEMO_USER } from '../types/mockusers'

export const authService = {
    login: async (email: string, password: string) => {
        await new Promise(resolve => setTimeout(resolve, 500)) // Simular API

        if (
            DEMO_USER.email !== email ||
            DEMO_USER.password !== password
        ) {
            throw new Error('Credenciales inválidas')
        }

        const { password: _, ...userWithoutPassword } = DEMO_USER

        localStorage.setItem('user', JSON.stringify(userWithoutPassword))
        localStorage.setItem('token', 'demo-token-' + DEMO_USER.id)

        return userWithoutPassword
    },

    logout: () => {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user')
        return userStr ? JSON.parse(userStr) : null
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token')
    }
}
