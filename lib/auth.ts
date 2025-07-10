import type { AuthUser } from "@/types/kullanici"

export const AUTH_STORAGE_KEY = "talep_takip_auth"

export function saveAuthUser(user: AuthUser) {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  }
}

export function getAuthUser(): AuthUser | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return null
      }
    }
  }
  return null
}

export function removeAuthUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.rol === "admin"
}
