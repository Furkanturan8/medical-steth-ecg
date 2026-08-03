"use client"

import { useActionState } from "react"

import { loginAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const [error, formAction, isPending] = useActionState(loginAction, undefined)

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Giriş Yap</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="username">Kullanıcı adı</Label>
            <Input id="username" name="username" required autoComplete="username" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
