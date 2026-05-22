export function loadJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch (err) {
    return fallback
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    // noop
  }
}

export const storageEvents = new EventTarget()

export function pushLog(entry) {
  const existing = loadJSON('logs', [])
  const newEntry = { id: Date.now(), fecha: new Date().toISOString(), ...entry }
  const updated = [newEntry, ...existing]
  saveJSON('logs', updated)
  storageEvents.dispatchEvent(new CustomEvent('logs', { detail: updated }))
}

export function setUsuarios(users) {
  saveJSON('usuarios', users)
  storageEvents.dispatchEvent(new CustomEvent('usuarios', { detail: users }))
}

export function setPermisos(permisos) {
  saveJSON('permisos', permisos)
  storageEvents.dispatchEvent(new CustomEvent('permisos', { detail: permisos }))
}

export default {
  loadJSON,
  saveJSON,
  pushLog,
  setUsuarios,
  setPermisos,
  storageEvents,
}
