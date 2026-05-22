import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardAction, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AUTH_SERVICE } from '@/services/auth'

function generateCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 6 }, () => characters[Math.floor(Math.random() * characters.length)]).join('')
}

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate()
  const [step, setStep] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading] = useState(false)

  const isValidEmail = (value) => /^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(value)
  const resetAlerts = () => setMessage({ type: '', text: '' })

  const handleLogin = (e) => {
    e.preventDefault()
    resetAlerts()

    if (!isValidEmail(email)) {
      setMessage({ type: 'error', text: 'Ingresa un correo válido.' })
      return
    }

    if (!password.trim()) {
      setMessage({ type: 'error', text: 'Ingresa tu contraseña.' })
      return
    }

    const resultado = AUTH_SERVICE.login(email, password)

    if (resultado.exitoso) {
      setMessage({ type: 'success', text: 'Iniciando sesión...' })
      setTimeout(() => {
        onLoginSuccess()
        navigate('/')
      }, 500)
    } else {
      setMessage({ type: 'error', text: resultado.error })
    }
  }

  const handleSendRecoveryCode = (e) => {
    e.preventDefault()
    resetAlerts()

    if (!isValidEmail(email)) {
      setMessage({ type: 'error', text: 'Ingresa un correo válido.' })
      return
    }

    // Verificar que el correo existe
    const usuarios = AUTH_SERVICE.obtenerUsuarios()
    if (!usuarios.some((u) => u.email === email)) {
      setMessage({ type: 'error', text: 'Este correo no está registrado.' })
      return
    }

    const code = generateCode()
    setRecoveryCode(code)
    setMessage({ type: 'success', text: `Código generado: ${code}` })
    setStep('verify-recovery-code')
  }

  const handleVerifyRecoveryCode = (e) => {
    e.preventDefault()
    resetAlerts()

    if (recoveryCodeInput !== recoveryCode) {
      setMessage({ type: 'error', text: 'Código incorrecto.' })
      return
    }

    setMessage({ type: 'success', text: 'Código verificado.' })
    setStep('new-password')
  }

  const handleSetNewPassword = (e) => {
    e.preventDefault()
    resetAlerts()

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' })
      return
    }

    const resultado = AUTH_SERVICE.cambiarContrasena(email, '', newPassword)

    if (resultado.exitoso) {
      setMessage({ type: 'success', text: 'Contraseña Actualizada correctamente' })
      setStep('success')
    } else {
      setMessage({ type: 'error', text: resultado.error })
    }
  }

  const resetToLogin = () => {
    setStep('login')
    setEmail('')
    setPassword('')
    setRecoveryCodeInput('')
    setNewPassword('')
    setConfirmPassword('')
    resetAlerts()
  }

  return (
    <div className="page flex items-center justify-center min-h-[calc(100vh-140px)] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {step === 'login'
                ? 'Iniciar sesión'
                : step === 'recovery-email'
                ? 'Recuperar acceso'
                : step === 'verify-recovery-code'
                ? 'Verificar código'
                : step === 'new-password'
                ? 'Nueva contraseña'
                : 'Éxito'}
            </CardTitle>
            {step !== 'login' && step !== 'success' && (
              <CardAction>
                <Button type="button" variant="ghost" size="sm" onClick={resetToLogin}>
                  Cancelar
                </Button>
              </CardAction>
            )}
          </div>
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

          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-input">Correo</Label>
                <Input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-input">Contraseña</Label>
                <Input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-2 flex-col">
                <Button type="submit" className="w-full">
                  Ingresar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    resetAlerts()
                    setStep('recovery-email')
                  }}
                >
                  ¿Olvidaste contraseña?
                </Button>
              </div>
            </form>
          )}

          {step === 'recovery-email' && (
            <form onSubmit={handleSendRecoveryCode} className="space-y-4">
              <p className="text-sm text-muted-foreground">Ingresa tu correo para recibir un código de recuperación.</p>
              <div className="space-y-2">
                <Label htmlFor="recovery-email-input">Correo</Label>
                <Input
                  id="recovery-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar código'}
              </Button>
            </form>
          )}

          {step === 'verify-recovery-code' && (
            <form onSubmit={handleVerifyRecoveryCode} className="space-y-4">
              <p className="text-sm text-muted-foreground">Ingresa el código de 6 caracteres.</p>
              <div className="space-y-2">
                <Label htmlFor="recovery-code-input">Código</Label>
                <Input
                  id="recovery-code-input"
                  type="text"
                  value={recoveryCodeInput}
                  onChange={(e) => setRecoveryCodeInput(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                />
              </div>
              <Button type="submit" disabled={recoveryCodeInput.length !== 6} className="w-full">
                Verificar código
              </Button>
            </form>
          )}

          {step === 'new-password' && (
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <p className="text-sm text-muted-foreground">Crea una nueva contraseña.</p>
              <div className="space-y-2">
                <Label htmlFor="new-password-input">Nueva contraseña</Label>
                <Input
                  id="new-password-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
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
                />
              </div>
              <Button
                type="submit"
                disabled={newPassword.length < 6 || newPassword !== confirmPassword}
                className="w-full"
              >
                Actualizar contraseña
              </Button>
            </form>
          )}

          {step === 'success' && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Tu contraseña ha sido actualizada correctamente.</p>
              <Button onClick={resetToLogin} className="w-full">
                Volver a iniciar sesión
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <p className="text-xs text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => navigate('/registro')}
            >
              Regístrate aquí
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}