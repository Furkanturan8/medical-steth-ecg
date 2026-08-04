import NextAuth from "next-auth"
import type { JWT } from "next-auth/jwt"
import Credentials from "next-auth/providers/credentials"

const DJANGO_API_URL = process.env.DJANGO_API_URL ?? "http://localhost:8000"
const ACCESS_TOKEN_LIFETIME_MS = 25 * 60 * 1000 // slightly under the 30min backend lifetime

// Bir sayfa yüklemesinde birden fazla Server Component/prefetch isteği aynı
// anda süresi dolmuş bir token görüp paralel refresh deneyebiliyor — bu da
// backend'i gereksiz yere yorup rate limit'e takılabiliyor. Aynı anda tek bir
// refresh isteği uçsun diye devam eden isteği burada paylaşıyoruz (yalnızca
// bu Node sürecinde geçerli, ama dev/tek-instance kurulum için yeterli).
let inFlightRefresh: Promise<JWT> | null = null

async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (inFlightRefresh) return inFlightRefresh

  inFlightRefresh = (async () => {
    try {
      const res = await fetch(`${DJANGO_API_URL}/api/accounts/v1/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: token.refreshToken }),
      })
      if (!res.ok) throw new Error("refresh failed")
      const data = await res.json()
      return {
        ...token,
        accessToken: data.access,
        accessTokenExpires: Date.now() + ACCESS_TOKEN_LIFETIME_MS,
      }
    } catch {
      return { ...token, error: "RefreshAccessTokenError" as const }
    } finally {
      inFlightRefresh = null
    }
  })()

  return inFlightRefresh
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Kullanıcı adı", type: "text" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch(`${DJANGO_API_URL}/api/accounts/v1/token/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        })
        if (!res.ok) return null
        const data = await res.json()
        return {
          id: credentials?.username as string,
          name: credentials?.username as string,
          accessToken: data.access,
          refreshToken: data.refresh,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: Date.now() + ACCESS_TOKEN_LIFETIME_MS,
        }
      }
      if (typeof token.accessTokenExpires === "number" && Date.now() < token.accessTokenExpires) {
        return token
      }
      return refreshAccessToken(token)
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.error = token.error
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
})
