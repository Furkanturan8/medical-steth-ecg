"use client"

import { useActionState } from "react"

import { updatePatientAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { PatientDetail } from "@/types/api"

export function EditPatientForm({ patient }: { patient: PatientDetail }) {
  const action = updatePatientAction.bind(null, patient.id)
  const [error, formAction, isPending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="mt-6 max-w-md space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="space-y-2">
        <Label htmlFor="full_name">Ad Soyad</Label>
        <Input id="full_name" name="full_name" defaultValue={patient.full_name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date_of_birth">Doğum Tarihi</Label>
        <Input id="date_of_birth" name="date_of_birth" type="date" defaultValue={patient.date_of_birth ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Not</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={patient.notes} />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Kaydediliyor..." : "Kaydet"}
      </Button>
    </form>
  )
}
