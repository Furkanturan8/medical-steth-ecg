import { auth } from "@/auth"

const DJANGO_API_URL = process.env.DJANGO_API_URL ?? "http://localhost:8000"

export async function djangoFetch(path: string, init: RequestInit = {}) {
  const session = await auth()

  const headers = new Headers(init.headers)
  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`)
  }
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  return fetch(`${DJANGO_API_URL}${path}`, { ...init, headers })
}
