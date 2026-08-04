import { redirect } from "next/navigation"

import { auth, signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import { djangoFetchJson } from "@/lib/api"
import type { User } from "@/types/api"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  if (!session) {
    redirect("/login")
  }
  if (session.error === "RefreshAccessTokenError") {
    await signOut({ redirectTo: "/login" })
  }

  const me = await djangoFetchJson<User>("/api/accounts/v1/me/")
  const doctorLabel = [me.first_name, me.last_name].filter(Boolean).join(" ") || me.username

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-6 py-4 print:hidden">
        <span className="font-semibold">Medikal Steteskop</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Dr. {doctorLabel}</span>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}
          >
            <Button type="submit" variant="outline" size="sm">
              Çıkış Yap
            </Button>
          </form>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
