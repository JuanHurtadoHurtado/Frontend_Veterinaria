import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AUTH_SERVICE } from '@/services/auth'

export default function Registro() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rol, setRol] = useState('usuario')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  const isValidEmail = (value) => /^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(value)
  const resetAlerts = () => setMessage({ type: '', text: '' })

  const handleRegistro = (e) => {
    e.preventDefault()
    resetAlerts()
    setLoading(true)

    // Validaciones
    if (!isValidEmail(email)) {
      setMessage({ type: 'error', text: 'Ingresa un correo válido.' })
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' })
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' })
      setLoading(false)
      return
    }

    // Intentar registro
    const resultado = AUTH_SERVICE.registro(email, password, rol)

    if (resultado.exitoso) {
      setMessage({ type: 'success', text: resultado.mensaje })
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } else {
      setMessage({ type: 'error', text: resultado.error })
    }

    setLoading(false)
  }

  return (
    <div className="page flex items-center justify-center min-h-[calc(100vh-140px)] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crear cuenta</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {message.text && (
            <div
              className={`rounded-lg p-3 text-sm ${
                message.type === 'error'
                  ? 'bg-destructive/10 text-destructive border border-destructive/30'
                  : message.type === 'success'
                  ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-200/70'
                  : 'bg-blue-100/80 text-blue-900 border border-blue-200/70'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleRegistro} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-input">Correo</Label>
              <Input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol-select">Tipo de cuenta</Label>
              <select
                id="rol-select"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                disabled={loading}
                className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus:border-ring focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
              >
                <option value="usuario">Usuario (Dueño de mascota)</option>
                <option value="veterinario">Veterinario</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password-input">Contraseña</Label>
              <Input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password-input">Confirmar contraseña</Label>
              <Input
                id="confirm-password-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <p className="text-xs text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => navigate('/login')}
            >
              Inicia sesión aquí
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
