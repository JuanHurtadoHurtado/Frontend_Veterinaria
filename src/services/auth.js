/**
 * Servicio de autenticación con localStorage
 * Gestiona usuarios, sesiones y validaciones
 */

const USUARIOS_KEY = 'usuarios'
const SESION_ACTUAL_KEY = 'sesionActual'

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
   */
  obtenerUsuarios: () => {
    return JSON.parse(localStorage.getItem(USUARIOS_KEY)) || []
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

    const sesion = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      fechaLogin: new Date().toISOString(),
    }

    localStorage.setItem(SESION_ACTUAL_KEY, JSON.stringify(sesion))
    return { exitoso: true, usuario: sesion }
  },

  /**
   * Registra un nuevo usuario (solo rol "usuario" o "veterinario")
   */
  registro: (email, password, rol = 'usuario') => {
    const usuarios = AUTH_SERVICE.obtenerUsuarios()

    // Validar que el email no esté registrado
    if (usuarios.some((u) => u.email === email)) {
      return { exitoso: false, error: 'Este correo ya está registrado.' }
    }

    // Validar que no intente registrarse como administrador
    if (rol === 'administrador') {
      return { exitoso: false, error: 'Ya existe un administrador. Solo puede haber uno.' }
    }

    // Validar rol permitido
    if (!['usuario', 'veterinario'].includes(rol)) {
      return { exitoso: false, error: 'Rol no válido.' }
    }

    const nuevoUsuario = {
      id: Date.now(),
      email,
      password,
      rol,
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
