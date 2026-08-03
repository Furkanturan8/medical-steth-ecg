import NextAuth from "next-auth"
import type { JWT } from "next-auth/jwt"
import Credentials from "next-auth/providers/credentials"

const DJANGO_API_URL = process.env.DJANGO_API_URL ?? "http://localhost:8000"
const ACCESS_TOKEN_LIFETIME_MS = 25 * 60 * 1000 // slightly under the 30min backend lifetime

async function refreshAccessToken(token: JWT): Promise<JWT> {
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
    return { ...token, error: "RefreshAccessTokenError" }
  }
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
