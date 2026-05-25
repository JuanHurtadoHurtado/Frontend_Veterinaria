import { useState } from 'react'
import { Eye, EyeOff, Calendar as CalendarIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { AUTH_SERVICE } from '@/services/auth'
import { loadJSON, pushLog, setMascotas } from '@/lib/storage'
import { format } from 'date-fns'

const ESPECIES = ['Perro', 'Gato', 'Ave', 'Conejo', 'Hámster', 'Reptil', 'Otro']
const DOCUMENTOS = ['DNI', 'CE']

export default function Registro() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    documentoTipo: 'DNI',
    documentoNumero: '',
    fechaNacimiento: '',
    telefono: '',
    email: '',
    password: '',
    confirmPassword: '',
    nombreMascota: '',
    especie: 'Perro',
    direccion: '',
  })

  const isValidEmail = (value) => /^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(value)
  const resetAlerts = () => setMessage({ type: '', text: '' })

  const getDisplayName = () => `${formData.nombres || ''} ${formData.apellidos || ''}`.trim()

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const inputClassName = 'h-11 rounded-xl border-[#0ebccc]/25 bg-white'

  const handleRegistro = (e) => {
    e.preventDefault()
    resetAlerts()
    setLoading(true)

    const nombres = formData.nombres.trim()
    const apellidos = formData.apellidos.trim()
    const email = formData.email.trim()
    const documentoNumero = String(formData.documentoNumero || '').trim()
    const telefono = String(formData.telefono || '').trim()
    const nombreMascota = formData.nombreMascota.trim()
    const direccion = formData.direccion.trim()
    const password = formData.password
    const confirmPassword = formData.confirmPassword

    if (!nombres || !apellidos || !email || !documentoNumero || !telefono || !nombreMascota || !direccion) {
      setMessage({ type: 'error', text: 'Completa todos los datos del usuario y la mascota.' })
      setLoading(false)
      return
    }

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

    if (formData.documentoTipo === 'DNI' && documentoNumero.length !== 8) {
      setMessage({ type: 'error', text: 'El DNI debe tener 8 dígitos.' })
      setLoading(false)
      return
    }

    if (formData.documentoTipo === 'CE' && documentoNumero.length !== 9) {
      setMessage({ type: 'error', text: 'El CE debe tener 9 dígitos.' })
      setLoading(false)
      return
    }

    if (telefono.length < 9) {
      setMessage({ type: 'error', text: 'Ingresa un teléfono válido.' })
      setLoading(false)
      return
    }

    const resultado = AUTH_SERVICE.registro({
      nombres,
      apellidos,
      documentoTipo: formData.documentoTipo,
      documentoNumero,
      telefono,
      email,
      password,
      fechaNacimiento: formData.fechaNacimiento,
      rol: 'usuario',
    })

    if (!resultado.exitoso) {
      setMessage({ type: 'error', text: resultado.error })
      setLoading(false)
      return
    }

    const mascotasActuales = loadJSON('mascotas', [])
    const nuevaMascota = {
      id: Date.now(),
      nombreMascota,
      especie: formData.especie,
      nombreDueno: getDisplayName(),
      tipoDocumento: formData.documentoTipo,
      numeroDocumento: documentoNumero,
      direccion,
      estado: 'activo',
    }

    const updatedMascotas = [...mascotasActuales, nuevaMascota]
    setMascotas(updatedMascotas)

    pushLog({
      usuario: email,
      accion: 'Registro público',
      detalle: `Creó cuenta de usuario y mascota ${nombreMascota}`,
    })

    setMessage({ type: 'success', text: 'Registro exitoso. Tu cuenta y tu mascota fueron creadas.' })

    setTimeout(() => {
      navigate('/login')
    }, 1500)

    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-gradient-to-br">
      <Card className="w-full max-w-3xl rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(14,188,204,0.12)] backdrop-blur-md">
        <CardContent className="space-y-6 p-0">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#eb008f]">Bienvenido</div>
              <h3 className="mt-1 text-2xl font-bold text-[#0f2f3a]">Crear cuenta</h3>
            </div>
          </div>

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

          <form onSubmit={handleRegistro} className="space-y-6">
            <section className="space-y-4 rounded-[1.6rem] border border-[#0ebccc]/20 bg-white/90 p-4 shadow-[0_10px_24px_rgba(14,188,204,0.08)]">
              <div className="inline-flex items-center rounded-full bg-[#fcd8fa] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#eb008f]">
                Datos del usuario
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombres">Nombres</Label>
                  <Input
                    id="nombres"
                    value={formData.nombres}
                    onChange={(e) => handleChange('nombres', e.target.value)}
                    placeholder=""
                    className={inputClassName}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidos">Apellidos</Label>
                  <Input
                    id="apellidos"
                    value={formData.apellidos}
                    onChange={(e) => handleChange('apellidos', e.target.value)}
                    placeholder=""
                    className={inputClassName}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[160px_minmax(0,1fr)]">
                <div className="space-y-2">
                  <Label htmlFor="documentoTipo">Tipo de documento</Label>
                  <Select
                    value={formData.documentoTipo}
                    onValueChange={(value) => handleChange('documentoTipo', value)}
                    disabled={loading}
                  >
                    <SelectTrigger id="documentoTipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENTOS.map((documento) => (
                        <SelectItem key={documento} value={documento}>
                          {documento}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentoNumero">Número de documento</Label>
                  <Input
                    id="documentoNumero"
                    value={formData.documentoNumero}
                    onChange={(e) =>
                      handleChange(
                        'documentoNumero',
                        e.target.value.replace(/[^0-9]/g, '').slice(0, formData.documentoTipo === 'DNI' ? 8 : 9),
                      )
                    }
                    maxLength={formData.documentoTipo === 'DNI' ? 8 : 9}
                    placeholder={formData.documentoTipo === 'DNI' ? '8 dígitos' : '9 dígitos'}
                    className={inputClassName}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value.replace(/\D/g, '').slice(0, 9))}
                    placeholder="9XXXXXXXX"
                    className={inputClassName}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="tu@correo.com"
                    className={inputClassName}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#0f2f3a]">Fecha de nacimiento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-11 w-full justify-start rounded-xl border-[#0ebccc]/25 bg-white text-left font-normal text-[#0f2f3a]"
                      disabled={loading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-[#0ebccc]" />
                      {formData.fechaNacimiento ? format(new Date(`${formData.fechaNacimiento}T00:00:00`), 'dd/MM/yyyy') : 'Selecciona una fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[19rem] rounded-2xl border border-[#0ebccc]/20 bg-white p-2 shadow-[0_20px_60px_rgba(14,188,204,0.14)]"
                    align="start"
                    side="bottom"
                    sideOffset={8}
                    avoidCollisions={false}
                  >
                    <Calendar
                      mode="single"
                      className="p-0"
                      selected={formData.fechaNacimiento ? new Date(`${formData.fechaNacimiento}T00:00:00`) : undefined}
                      onSelect={(date) =>
                        handleChange(
                          'fechaNacimiento',
                          date ? format(date, 'yyyy-MM-dd') : '',
                        )
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </section>

            <section className="space-y-4 rounded-[1.6rem] border border-[#0ebccc]/20 bg-white/90 p-4 shadow-[0_10px_24px_rgba(14,188,204,0.08)]">
              <div className="inline-flex items-center rounded-full bg-[#fcd8fa] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#eb008f]">
                Datos de la mascota
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nombreMascota">Nombre de la mascota</Label>
                  <Input
                    id="nombreMascota"
                    value={formData.nombreMascota}
                    onChange={(e) => handleChange('nombreMascota', e.target.value)}
                    placeholder=""
                    className={inputClassName}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="especie">Especie</Label>
                  <Select value={formData.especie} onValueChange={(value) => handleChange('especie', value)} disabled={loading}>
                    <SelectTrigger id="especie">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ESPECIES.map((especie) => (
                        <SelectItem key={especie} value={especie}>
                          {especie}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => handleChange('direccion', e.target.value)}
                    placeholder=""
                    className={inputClassName}
                    disabled={loading}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 rounded-[1.6rem] border border-[#0ebccc]/20 bg-white/90 p-4 shadow-[0_10px_24px_rgba(14,188,204,0.08)]">
              <div className="inline-flex items-center rounded-full bg-[#fcd8fa] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#eb008f]">
                Seguridad de acceso
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password-input">Contraseña</Label>
                  <div className="relative">
                      <Input
                        id="password-input"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        placeholder=""
                        className={inputClassName}
                        disabled={loading}
                      />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center p-1 text-slate-500 hover:text-slate-700 z-10"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password-input">Confirmar contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password-input"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder=""
                      className={inputClassName}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center p-1 text-slate-500 hover:text-slate-700 z-10"
                      aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <Button type="submit" className="h-11 w-full rounded-2xl bg-[#0ebccc] text-white shadow-[0_10px_24px_rgba(14,188,204,0.25)] hover:bg-[#0aa7b6]" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </form>
        </CardContent>

        <div className="mt-4 border-t border-[#0ebccc]/15 px-4 pt-4 pb-0">
          <p className="text-xs text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <button type="button" className="text-primary hover:underline" onClick={() => navigate('/login')}>
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </Card>
    </div>
  )
}
