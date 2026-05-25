/**
 * Servicio de autenticación con localStorage
 * Gestiona usuarios, sesiones y validaciones
 */

import { storageEvents } from '@/lib/storage'

const USUARIOS_KEY = 'usuarios'
const SESION_ACTUAL_KEY = 'sesionActual'

const normalizarRol = (rol) => String(rol || '').trim().toLowerCase()

export const AUTH_SERVICE = {
  /**
   * Inicializa el administrador semilla si no existe ningún usuario
   */
  inicializarAdminSemilla: () => {
    const usuarios = JSON.parse(localStorage.getItem(USUARIOS_KEY)) || []

    const existeAdmin = usuarios.some((u) => u.rol === 'administrador')

    if (!existeAdmin) {
      const adminSemilla = {
        id: Date.now(),
        email: 'admin@healthypets.com',
        nombres: 'HealthyPets',
        password: 'admin123',
        rol: 'administrador',
        fechaRegistro: new Date().toISOString(),
      }
      usuarios.push(adminSemilla)
      localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios))
      return {
        creado: true,
        email: adminSemilla.email,
        password: adminSemilla.password,
      }
    }

    return { creado: false }
  },

  /**
   * Obtiene todos los usuarios
   * Migra automáticamente el campo "correo" a "email" si no existe
   */
  obtenerUsuarios: () => {
    const usuarios = JSON.parse(localStorage.getItem(USUARIOS_KEY)) || []
    
    // Migración automática: copiar "correo" a "email" si no existe
    let migrado = false
    const usuariosMigrados = usuarios.map(usuario => {
      if (!usuario.email && usuario.correo) {
        migrado = true
        return { ...usuario, email: usuario.correo }
      }
      return usuario
    })
    
    // Guardar si hubo migración
    if (migrado) {
      localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuariosMigrados))
      return usuariosMigrados
    }
    
    return usuarios
  },

  /**
   * Valida credenciales y realiza login
   */
  login: (email, password) => {
    const usuarios = AUTH_SERVICE.obtenerUsuarios()
    const usuario = usuarios.find((u) => u.email === email && u.password === password)

    if (!usuario) {
      return { exitoso: false, error: 'Correo o contraseña incorrectos.' }
    }

    const rolNormalizado = normalizarRol(usuario.rol)

    const sesion = {
      id: usuario.id,
      email: usuario.email,
      rol: rolNormalizado,
      fechaLogin: new Date().toISOString(),
    }

    if (usuario.rol !== rolNormalizado) {
      usuario.rol = rolNormalizado
      localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios))
    }

    localStorage.setItem(SESION_ACTUAL_KEY, JSON.stringify(sesion))
    storageEvents.dispatchEvent(new CustomEvent('sesion', { detail: sesion }))
    return { exitoso: true, usuario: sesion }
  },

  /**
   * Registra un nuevo usuario.
   * Acepta una firma vieja (email, password, rol) o un objeto con los datos completos.
   * Desde la vista pública solo se permite rol "usuario".
   */
  registro: (payloadOrEmail, passwordArg, rolArg = 'usuario') => {
    const usuarios = AUTH_SERVICE.obtenerUsuarios()

    const payload =
      typeof payloadOrEmail === 'object' && payloadOrEmail !== null
        ? payloadOrEmail
        : { email: payloadOrEmail, password: passwordArg, rol: rolArg }

    const email = String(payload.email || '').trim()
    const password = String(payload.password || '')
    const rolNormalizado = normalizarRol(payload.rol || 'usuario')

    // Validar que el email no esté registrado
    if (usuarios.some((u) => u.email === email)) {
      return { exitoso: false, error: 'Este correo ya está registrado.' }
    }

    // Validar que no intente registrarse como administrador
    if (rolNormalizado === 'administrador') {
      return { exitoso: false, error: 'Ya existe un administrador. Solo puede haber uno.' }
    }

    // Validar rol permitido
    if (!['usuario', 'veterinario'].includes(rolNormalizado)) {
      return { exitoso: false, error: 'Rol no válido.' }
    }

    const nuevoUsuario = {
      id: Date.now(),
      email,
      password,
      rol: rolNormalizado,
      nombres: payload.nombres || '',
      apellidos: payload.apellidos || '',
      documentoTipo: payload.documentoTipo || '',
      documentoNumero: payload.documentoNumero || '',
      telefono: payload.telefono || '',
      fechaNacimiento: payload.fechaNacimiento || '',
      estado: 'activo',
      fechaRegistro: new Date().toISOString(),
    }

    usuarios.push(nuevoUsuario)
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios))

    return {
      exitoso: true,
      usuario: nuevoUsuario,
      mensaje: 'Registro exitoso. Ya puedes iniciar sesión.',
    }
  },

  /**
   * Obtiene la sesión actual
   */
  obtenerSesionActual: () => {
    const sesion = localStorage.getItem(SESION_ACTUAL_KEY)
    return sesion ? JSON.parse(sesion) : null
  },

  /**
   * Cierra la sesión
   */
  cerrarSesion: () => {
    localStorage.removeItem(SESION_ACTUAL_KEY)
    storageEvents.dispatchEvent(new CustomEvent('sesion', { detail: null }))
    return { exitoso: true }
  },

  /**
   * Valida si hay una sesión activa
   */
  haySessionActiva: () => {
    return AUTH_SERVICE.obtenerSesionActual() !== null
  },

  /**
   * Cambia la contraseña del usuario (solo si está logueado)
   */
  cambiarContrasena: (emailUsuario, contraseniaAnterior, contrasenianueva) => {
    const usuarios = AUTH_SERVICE.obtenerUsuarios()
    const usuario = usuarios.find((u) => u.email === emailUsuario && u.password === contraseniaAnterior)

    if (!usuario) {
      return { exitoso: false, error: 'Contraseña anterior incorrecta.' }
    }

    usuario.password = contrasenianueva
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios))

    return { exitoso: true, mensaje: 'Contraseña actualizada correctamente.' }
  },

  /**
   * Verifica si puede haber más administradores (siempre retorna false si ya hay uno)
   */
  puedeSerAdministrador: () => {
    const usuarios = AUTH_SERVICE.obtenerUsuarios()
    return !usuarios.some((u) => u.rol === 'administrador')
  },
}
