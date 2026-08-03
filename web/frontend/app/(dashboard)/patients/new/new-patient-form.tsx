"use client"

import { useActionState } from "react"

import { createPatientAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function NewPatientForm() {
  const [error, formAction, isPending] = useActionState(createPatientAction, undefined)

  return (
    <form action={formAction} className="mt-6 max-w-md space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="space-y-2">
        <Label htmlFor="full_name">Ad Soyad</Label>
        <Input id="full_name" name="full_name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date_of_birth">Doğum Tarihi</Label>
        <Input id="date_of_birth" name="date_of_birth" type="date" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Not</Label>
        <Textarea id="notes" name="notes" rows={3} />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Kaydediliyor..." : "Kaydet"}
      </Button>
    </form>
  )
}
