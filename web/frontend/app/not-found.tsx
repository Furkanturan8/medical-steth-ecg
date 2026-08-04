import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">Sayfa bulunamadı</h1>
      <p className="max-w-md text-muted-foreground">Aradığınız sayfa mevcut değil ya da taşınmış olabilir.</p>
      <Button render={<Link href="/" />}>Ana Sayfaya Dön</Button>
    </div>
  )
}
