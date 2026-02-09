import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/Dashboard'
import BooksPage from './pages/BooksPage'
import PrestamosPages from './pages/PrestamosPages'
import UserPage from './pages/UserPage'
import { authService } from './services/authService'

const App = () => {
    const isAuth = authService.isAuthenticated()

    return (
        <Routes>
            <Route
                path="/"
                element={<Navigate to={isAuth ? '/dashboard' : '/login'} replace />}
            />
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/dashboard"
                element={
                    isAuth ? <DashboardPage /> : <Navigate to="/login" replace />
                }
            />
            <Route
                path="/libros"
                element={
                    isAuth ? <BooksPage /> : <Navigate to="/login" replace />
                }
            />

            <Route
                path="/usuarios"
                element={
                    isAuth ? < UserPage /> : <Navigate to="/login" replace />
                }
            />

            <Route
                path="/prestamos"
                element={
                    isAuth ? < PrestamosPages /> : <Navigate to="/login" replace />
                }
            />
        </Routes>
    )
}

export default App
