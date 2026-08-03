import { redirect } from "next/navigation"

import { auth, signOut } from "@/auth"
import { Button } from "@/components/ui/button"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="font-semibold">Medikal Steteskop</span>
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
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
