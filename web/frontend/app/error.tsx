"use client"

import { Button } from "@/components/ui/button"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">Bir şeyler ters gitti</h1>
      <p className="max-w-md text-muted-foreground">{error.message || "Beklenmeyen bir hata oluştu."}</p>
      <Button onClick={() => reset()}>Tekrar Dene</Button>
    </div>
  )
}
