function get(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function set(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // ignore (e.g. private browsing quota exceeded)
  }
}

function remove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export const storage = { get, set, remove }
