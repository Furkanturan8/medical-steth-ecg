import { auth } from "@/auth"

const DJANGO_API_URL = process.env.DJANGO_API_URL ?? "http://localhost:8000"

export async function djangoFetch(path: string, init: RequestInit = {}) {
  const session = await auth()

  const headers = new Headers(init.headers)
  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`)
  }
  // Let fetch set the multipart boundary itself for FormData bodies.
  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  return fetch(`${DJANGO_API_URL}${path}`, { ...init, headers, cache: "no-store" })
}

export async function djangoFetchJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await djangoFetch(path, init)
  if (!res.ok) {
    throw new Error(`Django API ${path} -> ${res.status}`)
  }
  return res.json() as Promise<T>
}
