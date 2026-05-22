import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AUTH_SERVICE } from '@/services/auth'
import { Eye, EyeOff } from 'lucide-react'

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
  const [showPassword, setShowPassword] = useState(false)

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
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' })
      setStep('success')
    } else {
      setMessage({ type: 'error', text: resultado.error })
    }
  }

  const resetToLogin = () => {
    setStep('login')
    setEmail('')
    setPassword('')
    setRecoveryCode('')
    setRecoveryCodeInput('')
    setNewPassword('')
    setConfirmPassword('')
    resetAlerts()
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-gradient-to-br">
      <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(14,188,204,0.12)] backdrop-blur-md">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#eb008f]">Bienvenido</div>
            <h3 className="mt-1 text-2xl font-bold text-[#0f2f3a]">
              {step === 'login'
                ? 'Iniciar sesión'
                : step === 'recovery-email'
                ? 'Recuperar acceso'
                : step === 'verify-recovery-code'
                ? 'Verificar código'
                : step === 'new-password'
                ? 'Nueva contraseña'
                : 'Éxito'}
            </h3>
          </div>
          {step !== 'login' && step !== 'success' && (
            <Button type="button" variant="ghost" size="sm" onClick={resetToLogin} className="rounded-full">
              Cancelar
            </Button>
          )}
        </div>

        {message.text && (
          <div
            className={`mb-4 rounded-2xl border p-3 text-sm ${
              message.type === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-700'
                : message.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-sky-200 bg-sky-50 text-sky-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {step === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-input" className="text-[#0f2f3a]">Correo</Label>
                  <Input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="h-11 rounded-2xl border-[#0ebccc]/25 bg-white/90"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-input" className="text-[#0f2f3a]">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-11 rounded-2xl border-[#0ebccc]/25 bg-white/90 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 z-10 inline-flex -translate-y-1/2 items-center justify-center p-1 text-slate-500 hover:text-slate-700"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button type="submit" className="h-11 w-full rounded-2xl bg-[#0ebccc] text-white shadow-[0_10px_24px_rgba(14,188,204,0.25)] hover:bg-[#0aa7b6]">
                    Ingresar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full rounded-2xl border-[#0ebccc]/25 bg-white/80"
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
                <p className="text-sm text-[#0f2f3a]/70">Ingresa tu correo para recibir un código de recuperación.</p>
                <div className="space-y-2">
                  <Label htmlFor="recovery-email-input" className="text-[#0f2f3a]">Correo</Label>
                  <Input
                    id="recovery-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="h-11 rounded-2xl border-[#0ebccc]/25 bg-white/90"
                  />
                </div>
                <Button type="submit" className="h-11 w-full rounded-2xl bg-[#0ebccc] text-white hover:bg-[#0aa7b6]" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar código'}
                </Button>
              </form>
            )}

        {step === 'verify-recovery-code' && (
          <form onSubmit={handleVerifyRecoveryCode} className="space-y-4">
                <p className="text-sm text-[#0f2f3a]/70">Ingresa el código de 6 caracteres.</p>
                <div className="space-y-2">
                  <Label htmlFor="recovery-code-input" className="text-[#0f2f3a]">Código</Label>
                  <Input
                    id="recovery-code-input"
                    type="text"
                    value={recoveryCodeInput}
                    onChange={(e) => setRecoveryCodeInput(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    maxLength={6}
                    className="h-11 rounded-2xl border-[#0ebccc]/25 bg-white/90"
                  />
                </div>
                <Button type="submit" disabled={recoveryCodeInput.length !== 6} className="h-11 w-full rounded-2xl bg-[#0ebccc] text-white hover:bg-[#0aa7b6]">
                  Verificar código
                </Button>
              </form>
            )}

        {step === 'new-password' && (
          <form onSubmit={handleSetNewPassword} className="space-y-4">
                <p className="text-sm text-[#0f2f3a]/70">Crea una nueva contraseña.</p>
                <div className="space-y-2">
                  <Label htmlFor="new-password-input" className="text-[#0f2f3a]">Nueva contraseña</Label>
                  <Input
                    id="new-password-input"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 rounded-2xl border-[#0ebccc]/25 bg-white/90"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password-input" className="text-[#0f2f3a]">Confirmar contraseña</Label>
                  <Input
                    id="confirm-password-input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 rounded-2xl border-[#0ebccc]/25 bg-white/90"
                  />
                </div>
                <Button type="submit" disabled={newPassword.length < 6 || newPassword !== confirmPassword} className="h-11 w-full rounded-2xl bg-[#0ebccc] text-white hover:bg-[#0aa7b6]">
                  Actualizar contraseña
                </Button>
              </form>
            )}

        {step === 'success' && (
          <div className="space-y-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <span className="text-2xl">✓</span>
                </div>
                <p className="text-sm text-[#0f2f3a]/70">Tu contraseña ha sido actualizada correctamente.</p>
                <Button onClick={resetToLogin} className="h-11 w-full rounded-2xl bg-[#0ebccc] text-white hover:bg-[#0aa7b6]">
                  Volver a iniciar sesión
                </Button>
              </div>
            )}

        <div className="mt-6 border-t border-[#0ebccc]/15 pt-4 text-center text-xs text-[#0f2f3a]/70">
          ¿No tienes cuenta?{' '}
          <button type="button" className="text-[#0ebccc] hover:underline" onClick={() => navigate('/registro')}>
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  )
}
