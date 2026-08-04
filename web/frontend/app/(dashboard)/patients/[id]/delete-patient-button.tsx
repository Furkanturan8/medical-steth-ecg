"use client"

import { useTransition } from "react"

import { deletePatientAction } from "./actions"
import { Button } from "@/components/ui/button"

export function DeletePatientButton({ patientId }: { patientId: number }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm("Bu hastayı ve tüm kayıtlarını silmek istediğinize emin misiniz?")) return
        startTransition(async () => {
          await deletePatientAction(patientId)
        })
      }}
    >
      {isPending ? "Siliniyor..." : "Hastayı Sil"}
    </Button>
  )
}
