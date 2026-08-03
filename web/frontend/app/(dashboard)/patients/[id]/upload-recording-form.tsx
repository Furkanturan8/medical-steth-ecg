"use client"

import { useActionState } from "react"

import { uploadRecordingAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function UploadRecordingForm({ patientId }: { patientId: number }) {
  const action = uploadRecordingAction.bind(null, patientId)
  const [error, formAction, isPending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="mt-2 flex max-w-md items-end gap-3">
      <div className="flex-1 space-y-2">
        <Input name="audio_file" type="file" accept="audio/wav,.wav" required />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Yükleniyor ve analiz ediliyor..." : "Yükle"}
      </Button>
    </form>
  )
}
