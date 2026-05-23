import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import { AUTH_SERVICE } from './services/auth'
import { storageEvents } from './lib/storage'
import Sidebar from './components/ui/sidebar'
import AdminPersonal from './pages/admin/Personal'
import AdminClinica from './pages/admin/Clinica'
import AdminCitas from './pages/admin/Citas'
import AdminVeterinarios from './pages/admin/Veterinarios'
import Mascotas from './pages/Mascotas'
import GestionUsuarios from './pages/admin/Personal/GestionUsuarios'
import ControlAcceso from './pages/admin/Personal/ControlAcceso'
import RegistroActividades from './pages/admin/Personal/RegistroActividades'
import Documentos from './pages/admin/Clinica/Documentos'
import SeguimientoEnfermedades from './pages/admin/Clinica/SeguimientoEnfermedades'
import Veterinario from './pages/Veterinario'
import Login from './pages/Login'
import Usuario from './pages/Usuario'
import Registro from './pages/Registro'

function ProtectedRoute({ element, requiredRole, requiredRoles, sesion }) {
  const HOME_BY_ROLE = {
    administrador: '/administrador/personal/usuarios',
    recepcionista: '/recepcionista/citas',
    veterinario: '/veterinario',
    usuario: '/usuario',
  }
  const allowedRoles = requiredRoles || (requiredRole ? [requiredRole] : null)

  if (!sesion) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(sesion.rol)) {
    return <Navigate to={HOME_BY_ROLE[sesion.rol] || '/login'} replace />
  }

  return element
}

function AppLayout({ sesion, adminCreado, children }) {
  const location = useLocation()
  const showSidebar = Boolean(sesion) && !['/login', '/registro'].includes(location.pathname)

  return (
    <div className={`app-shell ${adminCreado ? 'pt-20' : ''}`}>
      <div className="flex min-h-[calc(100vh-4rem)]">
        {showSidebar && <Sidebar sesion={sesion} />}
        <main className="app-main flex-1">{children}</main>
      </div>
    </div>
  )
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

    const handleSesionChange = (event) => {
      setSesion(event.detail)
    }

    storageEvents.addEventListener('sesion', handleSesionChange)

    return () => {
      storageEvents.removeEventListener('sesion', handleSesionChange)
    }
  }, [])

  const handleLogin = () => {
    const sesionActual = AUTH_SERVICE.obtenerSesionActual()
    setSesion(sesionActual)
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
      <AppLayout sesion={sesion} adminCreado={adminCreado}>
        <Routes>
            <Route path="/login" element={<Login onLoginSuccess={handleLogin} />} />
            <Route path="/registro" element={<Registro />} />
            <Route
              path="/administrador"
              element={<Navigate to="/administrador/personal/usuarios" replace />}
            />
            <Route
              path="/administrador/mascotas"
              element={
                <ProtectedRoute
                  element={<Mascotas sesion={sesion} />}
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
              path="/administrador/citas"
              element={
                <ProtectedRoute
                  element={<AdminCitas sesion={sesion} />}
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
              path="/recepcionista"
              element={<Navigate to="/recepcionista/citas" replace />}
            />
            <Route
              path="/recepcionista/citas"
              element={
                <ProtectedRoute
                  element={<AdminCitas sesion={sesion} />}
                  requiredRole="recepcionista"
                  sesion={sesion}
                />
              }
            />
            <Route
              path="/recepcionista/mascotas"
              element={
                <ProtectedRoute
                  element={<Mascotas sesion={sesion} />}
                  requiredRoles={['administrador', 'recepcionista']}
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
              element={
                sesion ? (
                  <Navigate
                    to={
                      {
                        administrador: '/administrador/personal/usuarios',
                        recepcionista: '/recepcionista/citas',
                        veterinario: '/veterinario',
                        usuario: '/usuario',
                      }[sesion.rol] || '/login'
                    }
                    replace
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="*" element={<div>404 — Página no encontrada</div>} />
          </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App
