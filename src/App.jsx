import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import { AUTH_SERVICE } from './services/auth'
import { Button } from './components/ui/button'
import Sidebar from './components/ui/sidebar'
import Administrador from './pages/Administrador'
import AdminPersonal from './pages/admin/Personal'
import AdminClinica from './pages/admin/Clinica'
import AdminVeterinarios from './pages/admin/Veterinarios'
import GestionUsuarios from './pages/admin/Personal/GestionUsuarios'
import ControlAcceso from './pages/admin/Personal/ControlAcceso'
import RegistroActividades from './pages/admin/Personal/RegistroActividades'
import Documentos from './pages/admin/Clinica/Documentos'
import SeguimientoEnfermedades from './pages/admin/Clinica/SeguimientoEnfermedades'
import Veterinario from './pages/Veterinario'
import Login from './pages/Login'
import Usuario from './pages/Usuario'
import Registro from './pages/Registro'

function Header({ sesion, onLogout }) {
  const navigate = useNavigate()

  if (!sesion) return null

  const handleLogout = () => {
    AUTH_SERVICE.cerrarSesion()
    onLogout()
    navigate('/login')
  }

  return (
    <header className="app-header">
      <div className="brand">
        Veterinaria {sesion.rol === 'administrador' && '(Admin)'} {sesion.rol === 'veterinario' && '(Vet)'}
      </div>
      <div className="nav">
        {sesion.rol === 'administrador' && (
          <Button variant="ghost" size="sm" onClick={() => navigate('/administrador')}>
            Admin
          </Button>
        )}
        {sesion.rol === 'usuario' && (
          <Button variant="ghost" size="sm" onClick={() => navigate('/usuario')}>
            Usuario
          </Button>
        )}
        {sesion.rol === 'veterinario' && (
          <Button variant="ghost" size="sm" onClick={() => navigate('/veterinario')}>
            Veterinario
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>
    </header>
  )
}

function ProtectedRoute({ element, requiredRole, sesion }) {
  if (!sesion) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && sesion.rol !== requiredRole) {
    return <Navigate to={sesion.rol === 'administrador' ? '/administrador' : '/usuario'} replace />
  }

  return element
}

function App() {
  const [sesion, setSesion] = useState(null)
  const [adminCreado, setAdminCreado] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Inicializar admin semilla
    const resultado = AUTH_SERVICE.inicializarAdminSemilla()
    const sesionActual = AUTH_SERVICE.obtenerSesionActual()

    // Agrupar actualizaciones en microtarea para evitar renders en cascada
    Promise.resolve().then(() => {
      setAdminCreado(Boolean(resultado.creado))
      setSesion(sesionActual)
      setLoading(false)
    })
  }, [])

  const handleLogin = () => {
    const sesionActual = AUTH_SERVICE.obtenerSesionActual()
    setSesion(sesionActual)
  }

  const handleLogout = () => {
    setSesion(null)
  }

  if (loading) {
    return (
      <div className="app-shell">
        <div className="app-main flex items-center justify-center">
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      {adminCreado && (
        <div className="fixed top-0 left-0 right-0 bg-emerald-100 border-b border-emerald-300 p-4 text-emerald-900 text-center z-50 animate-pulse">
          ✓ Admin semilla creado: admin@healthypets.com / admin123
        </div>
      )}
      <div className={`app-shell ${adminCreado ? 'pt-20' : ''}`}>
        <Header sesion={sesion} onLogout={handleLogout} />

        <div className="flex">
          <Sidebar sesion={sesion} />
          <main className="app-main flex-1">
            <Routes>
            <Route path="/login" element={<Login onLoginSuccess={handleLogin} />} />
            <Route path="/registro" element={<Registro />} />
            <Route
              path="/administrador"
              element={
                <ProtectedRoute
                  element={<Administrador sesion={sesion} />}
                  requiredRole="administrador"
                  sesion={sesion}
                />
              }
            />
            <Route
              path="/administrador/personal"
              element={
                <ProtectedRoute
                  element={<AdminPersonal sesion={sesion} />}
                  requiredRole="administrador"
                  sesion={sesion}
                />
              }
            />
            <Route
              path="/administrador/personal/usuarios"
              element={
                <ProtectedRoute
                  element={<GestionUsuarios sesion={sesion} />}
                  requiredRole="administrador"
                  sesion={sesion}
                />
              }
            />
            <Route
              path="/administrador/personal/permisos"
              element={
                <ProtectedRoute
                  element={<ControlAcceso sesion={sesion} />}
                  requiredRole="administrador"
                  sesion={sesion}
                />
              }
            />
            <Route
              path="/administrador/personal/logs"
              element={
                <ProtectedRoute
                  element={<RegistroActividades sesion={sesion} />}
                  requiredRole="administrador"
                  sesion={sesion}
                />
              }
            />
            <Route
              path="/administrador/clinica"
              element={
                <ProtectedRoute
                  element={<AdminClinica sesion={sesion} />}
                  requiredRole="administrador"
                  sesion={sesion}
                />
              }
            />
            <Route
              path="/administrador/clinica/documentos"
              element={
                <ProtectedRoute
                  element={<Documentos sesion={sesion} />}
                  requiredRole="administrador"
                  sesion={sesion}
                />
              }
            />
            <Route
              path="/administrador/clinica/seguimiento"
              element={
                <ProtectedRoute
                  element={<SeguimientoEnfermedades sesion={sesion} />}
                  requiredRole="administrador"
                  sesion={sesion}
                />
              }
            />
            <Route
              path="/administrador/veterinarios"
              element={
                <ProtectedRoute
                  element={<AdminVeterinarios sesion={sesion} />}
                  requiredRole="administrador"
                  sesion={sesion}
                />
              }
            />
            
            <Route
              path="/veterinario"
              element={
                <ProtectedRoute
                  element={<Veterinario sesion={sesion} />}
                  requiredRole="veterinario"
                  sesion={sesion}
                />
              }
            />
            <Route
              path="/usuario"
              element={
                <ProtectedRoute
                  element={<Usuario sesion={sesion} />}
                  requiredRole="usuario"
                  sesion={sesion}
                />
              }
            />
            <Route
              path="/"
              element={sesion ? <Navigate to={sesion.rol === 'administrador' ? '/administrador' : sesion.rol === 'veterinario' ? '/veterinario' : '/usuario'} replace /> : <Navigate to="/login" replace />}
            />
            <Route path="*" element={<div>404 — Página no encontrada</div>} />
          </Routes>
          </main>
        </div>

        <footer className="app-footer">© {new Date().getFullYear()} Veterinaria</footer>
      </div>
    </BrowserRouter>
  )
}

export default App
