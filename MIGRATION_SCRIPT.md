# Script de Migración: Correo → Email

## Problema Resuelto
Se ha estandarizado el campo de correo electrónico de `correo` a `email` en todo el sistema.

## Cambios Realizados

### 1. **auth.js**
- ✅ Eliminado el campo duplicado `correo` en la función `registro()`
- ✅ Agregada migración automática en `obtenerUsuarios()` que copia `correo` a `email` si no existe

### 2. **GestionUsuarios.jsx**
- ✅ Cambiado `formData.correo` a `formData.email`
- ✅ Actualizado todos los usuarios iniciales para usar `email`
- ✅ Actualizado el formulario de edición/creación
- ✅ Actualizado la tabla de visualización
- ✅ Actualizado los logs

### 3. **Veterinarios.jsx**
- ✅ Cambiado `correo` a `email` en `baseRecord`
- ✅ Actualizado el detalle del veterinario

### 4. **Registro.jsx**
- ✅ Cambiado `formData.correo` a `formData.email`
- ✅ Actualizado el campo del formulario
- ✅ Actualizado los logs

### 5. **RegistroActividades.jsx**
- ✅ Simplificado la búsqueda de usuarios para usar solo `email`

## Migración Automática

El sistema ahora incluye una **migración automática** en `auth.js` que se ejecuta cada vez que se llama a `obtenerUsuarios()`. Esta migración:

1. Lee todos los usuarios del localStorage
2. Si un usuario tiene `correo` pero NO tiene `email`, copia el valor de `correo` a `email`
3. Guarda los usuarios actualizados en localStorage

## Script Manual de Migración (Opcional)

Si deseas ejecutar la migración manualmente en la consola del navegador, usa este script:

```javascript
// Script de migración manual
(function() {
  const USUARIOS_KEY = 'usuarios';
  const usuarios = JSON.parse(localStorage.getItem(USUARIOS_KEY)) || [];
  
  let migrados = 0;
  const usuariosMigrados = usuarios.map(usuario => {
    if (!usuario.email && usuario.correo) {
      migrados++;
      console.log(`Migrando usuario: ${usuario.correo}`);
      return { ...usuario, email: usuario.correo };
    }
    return usuario;
  });
  
  if (migrados > 0) {
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuariosMigrados));
    console.log(`✅ Migración completada: ${migrados} usuario(s) actualizado(s)`);
    console.log('Usuarios migrados:', usuariosMigrados);
  } else {
    console.log('✅ No se requiere migración. Todos los usuarios ya tienen el campo "email"');
  }
  
  // Verificar el resultado
  const verificacion = JSON.parse(localStorage.getItem(USUARIOS_KEY));
  console.log('Estado actual de usuarios:', verificacion);
})();
```

## Verificación

Para verificar que la migración funcionó correctamente, ejecuta en la consola:

```javascript
// Verificar usuarios
const usuarios = JSON.parse(localStorage.getItem('usuarios'));
console.table(usuarios.map(u => ({
  id: u.id,
  nombres: u.nombres,
  email: u.email,
  correo: u.correo,
  rol: u.rol,
  tieneEmail: !!u.email,
  tieneCorreo: !!u.correo
})));
```

## Prueba de Login

Después de la migración, intenta iniciar sesión con:
- **Email:** vet1@gmail.com (o el email que aparece en la tabla de usuarios)
- **Contraseña:** acampos45123687 (o la contraseña que aparece en la tabla)

## Notas Importantes

1. **La migración automática se ejecuta cada vez que se carga la aplicación**, por lo que no necesitas hacer nada manualmente.

2. **Los usuarios nuevos** creados después de estos cambios solo tendrán el campo `email`.

3. **Compatibilidad hacia atrás:** El sistema ahora es consistente y usa solo `email` en todas partes.

4. **Limpieza futura:** Si lo deseas, puedes eliminar el campo `correo` de los usuarios antiguos ejecutando:

```javascript
// Limpiar campo "correo" (opcional)
const usuarios = JSON.parse(localStorage.getItem('usuarios'));
const usuariosLimpios = usuarios.map(u => {
  const { correo, ...resto } = u;
  return resto;
});
localStorage.setItem('usuarios', JSON.stringify(usuariosLimpios));
console.log('✅ Campo "correo" eliminado de todos los usuarios');
```

## Solución del Problema Original

El problema era que:
- Los usuarios creados desde `GestionUsuarios.jsx` solo tenían el campo `correo`
- La función `login()` buscaba por el campo `email`
- Resultado: El login fallaba

Ahora:
- Todos los usuarios tienen el campo `email`
- La migración automática asegura compatibilidad con datos antiguos
- El sistema es consistente en todas partes
