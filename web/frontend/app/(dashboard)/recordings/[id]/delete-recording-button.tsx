"use client"

import { useTransition } from "react"

import { deleteRecordingAction } from "./actions"
import { Button } from "@/components/ui/button"

export function DeleteRecordingButton({ recordingId, patientId }: { recordingId: number; patientId: number }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      className="print:hidden"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm("Bu kaydı silmek istediğinize emin misiniz?")) return
        startTransition(async () => {
          await deleteRecordingAction(recordingId, patientId)
        })
      }}
    >
      {isPending ? "Siliniyor..." : "Kaydı Sil"}
    </Button>
  )
}
