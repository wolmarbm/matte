export const SESSIONS_KEY = 'pizza-fractions-sessions'
export const STUDENT_NAME_KEY = 'pizza-fractions-student-name'

const hasStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

export function loadSessions() {
  if (!hasStorage()) return []
  try {
    const raw = window.localStorage.getItem(SESSIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveSession(session) {
  const sessions = loadSessions()
  const next = [...sessions, session]
  if (!hasStorage()) return next
  try {
    window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(next))
  } catch {
    // Ignore write errors (quota, privacy mode, etc.)
  }
  return next
}

export function loadLatestSession() {
  const sessions = loadSessions()
  if (sessions.length === 0) return null
  return sessions[sessions.length - 1]
}

export function clearSessions() {
  if (!hasStorage()) return
  try {
    window.localStorage.removeItem(SESSIONS_KEY)
  } catch {
    // Ignore write errors
  }
}

export function saveStudentName(name) {
  if (!hasStorage()) return
  try {
    if (typeof name === 'string' && name.length > 0) {
      window.localStorage.setItem(STUDENT_NAME_KEY, name)
    }
  } catch {
    // Ignore write errors
  }
}

export function loadStudentName() {
  if (!hasStorage()) return ''
  try {
    return window.localStorage.getItem(STUDENT_NAME_KEY) || ''
  } catch {
    return ''
  }
}
